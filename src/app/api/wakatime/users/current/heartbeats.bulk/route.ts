import { NextRequest, NextResponse } from "next/server";
import { validateWakatimeApiAuth } from "@/lib/auth/wakatime-api-auth";
import { heartbeatService } from "@/lib/backend/services/heartbeat";
import { wakatimeApiClient } from "@/lib/backend/client/wakatime";
import { wakapiClient } from "@/lib/backend/client/wakapi";
import { markSetupCompleteOnFirstHeartbeat } from "@/lib/app/actions/setup";
import { bulkHeartbeatsRequestSchema } from "@/shared/schemas/wakatime";
import { v4 as uuidv4 } from "uuid";
import {
  createValidationErrorResponse,
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/api-responses";

// POST /api/wakatime/users/current/heartbeats.bulk
export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.log("🔄 [WakaTime Bulk API] Incoming bulk heartbeat request");
    console.log("📋 Headers:", Object.fromEntries(request.headers.entries()));
  }

  try {
    // Validate authentication (supports both API key and session)
    const authResult = await validateWakatimeApiAuth(request);

    if (!authResult.success) {
      if (isDev) {
        console.log(
          "❌ [WakaTime Bulk API] Authentication failed:",
          authResult.error,
        );
      }
      return createAuthErrorResponse(authResult.error);
    }

    if (isDev) {
      console.log(
        `✅ [WakaTime Bulk API] Authenticated via ${authResult.authMethod} for user:`,
        authResult.userId,
      );
    }

    let body;
    try {
      body = await request.json();
      if (isDev)
        console.log(
          "📦 [WakaTime Bulk API] Request body:",
          JSON.stringify(body, null, 2),
        );
    } catch (error) {
      if (isDev)
        console.log(
          "❌ [WakaTime Bulk API] Invalid JSON in request body:",
          error,
        );
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const validationResult = bulkHeartbeatsRequestSchema.safeParse(body);
    if (!validationResult.success) {
      if (isDev) {
        console.log("❌ [WakaTime Bulk API] Heartbeat validation failed:");
        console.log("Validation errors:", validationResult.error.format());
      }
      return createValidationErrorResponse(
        validationResult.error,
        "Invalid bulk heartbeat data",
      );
    }

    const heartbeats = validationResult.data;

    if (isDev) {
      console.log(
        `✅ [WakaTime Bulk API] Validated ${heartbeats.length} heartbeat(s)`,
      );
      heartbeats.forEach((hb, i) => {
        console.log(
          `  ${i + 1}. ${hb.entity} (${hb.type}, ${hb.category}) at ${new Date(hb.time * 1000).toISOString()}`,
        );
      });
    }

    // Process heartbeats using the heartbeat service (for local storage)
    const result = await heartbeatService.processHeartbeats(
      authResult.userId,
      heartbeats,
    );

    if (!result.success && result.errors.length > 0) {
      if (isDev) {
        console.log(
          "⚠️ [WakaTime Bulk API] Processing warnings:",
          result.errors,
        );
      }
    }

    // Mark setup as complete on first successful heartbeat
    if (result.processed > 0) {
      try {
        await markSetupCompleteOnFirstHeartbeat(authResult.userId);
        if (isDev) {
          console.log(
            "✅ [WakaTime Bulk API] Setup marked as complete on first heartbeat",
          );
        }
      } catch (error) {
        if (isDev) {
          console.log(
            "⚠️ [WakaTime Bulk API] Failed to mark setup complete:",
            error,
          );
        }
      }
    }

    // Convert heartbeats to WakaTime format for forwarding
    const wakatimeHeartbeats = heartbeats.map((hb) => ({
      time: hb.time,
      entity: hb.entity,
      type: hb.type,
      category: hb.category || "coding",
      project: hb.project,
      project_root_count: hb.project_root_count,
      branch: hb.branch,
      language: hb.language,
      dependencies: hb.dependencies,
      lines: hb.lines,
      line_additions: hb.line_additions,
      line_deletions: hb.line_deletions,
      lineno: hb.lineno,
      cursorpos: hb.cursorpos,
      is_write: hb.is_write,
    }));

    // Forward directly to WakaTime
    let wakatimeSuccess = false;
    try {
      // Check if user has OAuth token first
      const hasToken = await wakatimeApiClient.hasValidToken(authResult.userId);
      if (isDev) {
        console.log(
          `🔑 [WakaTime Bulk API] OAuth token available: ${hasToken ? "YES" : "NO"}`,
        );
      }

      wakatimeSuccess = await wakatimeApiClient.sendHeartbeat(
        authResult.userId,
        wakatimeHeartbeats,
      );
      if (isDev) {
        console.log(
          `🚀 [WakaTime Bulk API] WakaTime forward: ${wakatimeSuccess ? "SUCCESS" : "FAILED"}`,
        );
      }
    } catch (error) {
      if (isDev) {
        console.log("❌ [WakaTime Bulk API] WakaTime forward error:", error);
      }
    }

    // Forward directly to Wakapi instances
    let wakapiResults: { successful: string[]; failed: string[] } = {
      successful: [],
      failed: [],
    };
    try {
      wakapiResults = await wakapiClient.sendHeartbeatToAllInstances(
        authResult.userId,
        wakatimeHeartbeats,
      );
      if (isDev) {
        console.log(
          `🚀 [WakaTime Bulk API] Wakapi forward: ${wakapiResults.successful.length} success, ${wakapiResults.failed.length} failed`,
        );
      }
    } catch (error) {
      if (isDev) {
        console.log("❌ [WakaTime Bulk API] Wakapi forward error:", error);
      }
    }

    if (isDev) {
      console.log(
        `✅ [WakaTime Bulk API] Processed ${result.processed} heartbeats locally, forwarded to ${wakatimeSuccess ? 1 : 0} WakaTime + ${wakapiResults.successful.length} Wakapi instances`,
      );
    }

    // Return WakaTime-compatible bulk response (responses array with [response, status] pairs)
    const response = {
      responses: heartbeats.map((heartbeat) => [
        {
          data: {
            id: uuidv4(),
            entity: heartbeat.entity,
            type: heartbeat.type,
            time: heartbeat.time,
          },
        },
        201,
      ]),
    };

    if (isDev) {
      console.log(
        "📤 [WakaTime Bulk API] Sending response:",
        JSON.stringify(response, null, 2),
      );
    }

    // Always return success to the client (WakaTime API behavior)
    return createSuccessResponse(response, 202);
  } catch (error) {
    if (isDev) {
      console.log("💥 [WakaTime Bulk API] Unhandled error:", error);
      console.log(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace",
      );
    }
    console.error("Error in bulk heartbeats endpoint:", error);
    return createServerErrorResponse();
  }
}
