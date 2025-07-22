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
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return createAuthErrorResponse("Missing or invalid Authorization header");
    }

    const apiKey = authHeader.replace("Bearer ", "");

    const apiKeyValidation = await validateEditorUser(apiKey);

    if (!apiKeyValidation.valid) {
      return createAuthErrorResponse(
        apiKeyValidation.error || "Invalid API key",
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const validationResult = heartbeatsRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        "Invalid heartbeat data",
      );
    }

    const heartbeats: WakatimeHeartbeat[] = Array.isArray(validationResult.data)
      ? validationResult.data
      : [validationResult.data];

    // For now, we'll just return success without forwarding to external services
    // This is because the WakaTime OAuth implementation is not complete
    // TODO: Implement proper OAuth token management and remove this shortcut

    return createSuccessResponse(
      {
        responses: heartbeats.map(() => ({
          data: null,
          status: 201,
        })),
      },
      201,
    );
  } catch (error) {
    console.error("Error in heartbeats endpoint:", error);
    return createServerErrorResponse();
  }
}
