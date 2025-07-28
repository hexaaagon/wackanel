import { NextRequest, NextResponse } from "next/server";
import { validateWakatimeApiAuth } from "@/lib/auth/wakatime-api-auth";
import { heartbeatService } from "@/lib/backend/services/heartbeat";
import { markSetupCompleteOnFirstHeartbeat } from "@/lib/app/actions/setup";
import { v4 as uuidv4 } from "uuid";
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
    // Validate authentication (supports both API key and session)
    const authResult = await validateWakatimeApiAuth(request);

    if (!authResult.success) {
      if (isDev) {
        console.log(
          "❌ [WakaTime API] Authentication failed:",
          authResult.error,
        );
      }
      return createAuthErrorResponse(authResult.error);
    }

    if (isDev) {
      console.log(
        `✅ [WakaTime API] Authenticated via ${authResult.authMethod} for user:`,
        authResult.userId,
      );
    }

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

    // Process heartbeats using the heartbeat service
    const result = await heartbeatService.processHeartbeats(
      authResult.userId,
      heartbeats,
    );

    if (!result.success && result.errors.length > 0) {
      if (isDev) {
        console.log("⚠️ [WakaTime API] Processing warnings:", result.errors);
      }
    }

    if (isDev) {
      console.log(
        `✅ [WakaTime API] Processed ${result.processed} heartbeats, queued ${result.queued} for external instances`,
      );
    }

    // Mark setup as complete on first successful heartbeat
    if (result.processed > 0) {
      try {
        await markSetupCompleteOnFirstHeartbeat(authResult.userId);
        if (isDev) {
          console.log(
            "✅ [WakaTime API] Setup marked as complete on first heartbeat",
          );
        }
      } catch (error) {
        if (isDev) {
          console.log(
            "⚠️ [WakaTime API] Failed to mark setup complete:",
            error,
          );
        }
      }
    }

    // Return WakaTime-compatible response
    const response = heartbeats.map((heartbeat) => ({
      data: {
        id: uuidv4(),
        entity: heartbeat.entity,
        type: heartbeat.type,
        time: heartbeat.time,
      },
    }));

    if (isDev) {
      console.log(
        "📤 [WakaTime API] Sending response:",
        JSON.stringify(response, null, 2),
      );
    }

    return createSuccessResponse(response, 202);
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
