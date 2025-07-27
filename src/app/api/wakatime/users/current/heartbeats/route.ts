import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/drizzle";
import { wakatimePendingHeartbeats } from "@/lib/database/drizzle/schema/wakatime";
import { validateEditorUser } from "@/lib/auth/api-key/validator";
import { wakatimeApiClient } from "@/lib/backend/client/wakatime";
import { wakapiClient } from "@/lib/backend/client/wakapi";
import {
  heartbeatsRequestSchema,
  type WakatimeHeartbeat,
} from "@/shared/schemas/wakatime";
import {
  createValidationErrorResponse,
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/api-responses";

// POST /api/wakatime/users/current/heartbeats
export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.log("🔄 [WakaTime API] Incoming heartbeat request");
    console.log("📋 Headers:", Object.fromEntries(request.headers.entries()));
  }

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      if (isDev)
        console.log("❌ [WakaTime API] Missing/invalid Authorization header");
      return createAuthErrorResponse("Missing or invalid Authorization header");
    }

    const apiKey = authHeader.replace("Bearer ", "");
    if (isDev)
      console.log("🔑 [WakaTime API] API Key:", `${apiKey.substring(0, 8)}...`);

    const apiKeyValidation = await validateEditorUser(apiKey);

    if (!apiKeyValidation.valid) {
      if (isDev)
        console.log(
          "❌ [WakaTime API] API key validation failed:",
          apiKeyValidation.error,
        );
      return createAuthErrorResponse(
        apiKeyValidation.error || "Invalid API key",
      );
    }

    if (isDev)
      console.log(
        "✅ [WakaTime API] API key validated for user:",
        apiKeyValidation.userId,
      );

    let body;
    try {
      body = await request.json();
      if (isDev)
        console.log(
          "📦 [WakaTime API] Request body:",
          JSON.stringify(body, null, 2),
        );
    } catch (error) {
      if (isDev)
        console.log("❌ [WakaTime API] Invalid JSON in request body:", error);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const validationResult = heartbeatsRequestSchema.safeParse(body);
    if (!validationResult.success) {
      if (isDev) {
        console.log("❌ [WakaTime API] Heartbeat validation failed:");
        console.log("Validation errors:", validationResult.error.format());
      }
      return createValidationErrorResponse(
        validationResult.error,
        "Invalid heartbeat data",
      );
    }

    const heartbeats: WakatimeHeartbeat[] = Array.isArray(validationResult.data)
      ? validationResult.data
      : [validationResult.data];

    if (isDev) {
      console.log(
        `✅ [WakaTime API] Validated ${heartbeats.length} heartbeat(s)`,
      );
      heartbeats.forEach((hb, i) => {
        console.log(
          `  ${i + 1}. ${hb.entity} (${hb.type}, ${hb.category}) at ${new Date(hb.time * 1000).toISOString()}`,
        );
      });
    }

    // TODO: Implement proper OAuth token management and remove this shortcut
    const response = heartbeats.map(() => ({
      data: null,
      status: 201,
    }));

    if (isDev) {
      console.log(
        "📤 [WakaTime API] Sending response:",
        JSON.stringify(response, null, 2),
      );
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (isDev) {
      console.log("💥 [WakaTime API] Unhandled error:", error);
      console.log(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace",
      );
    }
    console.error("Error in heartbeats endpoint:", error);
    return createServerErrorResponse();
  }
}
