import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db_drizzle";
import { wakatimePendingHeartbeats } from "@/lib/db_drizzle/schema/wakatime";
import { validateApiKey } from "@/lib/auth/api-key-validator";
import { wakatimeApiClient } from "@/lib/external/wakatime-api";
import { wakapiClient } from "@/lib/external/wakapi-client";
import { bulkHeartbeatsRequestSchema } from "@/shared/schemas/wakatime";
import {
  createValidationErrorResponse,
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/misc/utils/api-responses";

// POST /api/wakatime/users/current/heartbeats.bulk
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return createAuthErrorResponse("Missing or invalid Authorization header");
    }

    const apiKey = authHeader.replace("Bearer ", "");

    const apiKeyValidation = await validateApiKey(apiKey);

    if (!apiKeyValidation.valid) {
      return createAuthErrorResponse(
        apiKeyValidation.error || "Invalid API key",
      );
    }

    const user = apiKeyValidation.apiKey.key;

    if (!user || !user.userId) {
      return createAuthErrorResponse("Invalid API key structure");
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

    const validationResult = bulkHeartbeatsRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        "Invalid bulk heartbeat data",
      );
    }

    const heartbeats = validationResult.data;

    // Try to forward to external services immediately
    const forwardingPromises = [];

    // Forward to WakaTime
    forwardingPromises.push(
      wakatimeApiClient
        .sendHeartbeat(user.userId, heartbeats)
        .then((success) => ({ service: "wakatime", success }))
        .catch((error) => {
          console.error("Error forwarding to WakaTime:", error);
          return { service: "wakatime", success: false };
        }),
    );

    // Forward to Wakapi instances
    forwardingPromises.push(
      wakapiClient
        .sendHeartbeatToAllInstances(user.userId, heartbeats)
        .then((results) => ({
          service: "wakapi",
          success: results.successful.length > 0,
          results,
        }))
        .catch((error) => {
          console.error("Error forwarding to Wakapi instances:", error);
          return { service: "wakapi", success: false };
        }),
    );

    // Wait for all forwarding attempts
    const forwardingResults = await Promise.all(forwardingPromises);

    // Check if any forwarding succeeded
    const anySucceeded = forwardingResults.some((result) => result.success);

    // If no forwarding succeeded, store in pending table for later retry
    if (!anySucceeded) {
      console.log("All forwarding attempts failed, storing in pending table");

      // Get all target instances for this user (WakaTime + Wakapi instances)
      const wakapiInstances = await wakapiClient.getInstancesForUser(
        user.userId,
      );
      const targetInstances = [
        "wakatime", // Always include WakaTime
        ...wakapiInstances.map((instance) => instance.id),
      ];

      const pendingPromises = heartbeats.map((heartbeat) =>
        db
          .insert(wakatimePendingHeartbeats)
          .values({
            userId: user.userId,
            instances: targetInstances, // Track which instances need to receive this heartbeat
            entity: heartbeat.entity,
            type: heartbeat.type,
            category: heartbeat.category,
            time: heartbeat.time,
            project: heartbeat.project,
            projectRootCount: heartbeat.project_root_count,
            branch: heartbeat.branch,
            language: heartbeat.language,
            dependencies: heartbeat.dependencies,
            lines: heartbeat.lines,
            lineAdditions: heartbeat.line_additions,
            lineDeletions: heartbeat.line_deletions,
            lineno: heartbeat.lineno,
            cursorpos: heartbeat.cursorpos,
            isWrite: heartbeat.is_write,
          })
          .returning()
          .catch((error) => {
            console.error("Error storing pending heartbeat:", error);
            return null;
          }),
      );

      await Promise.all(pendingPromises);
    }

    // Always return success to the client (WakaTime API behavior)
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
    console.error("Error in bulk heartbeats endpoint:", error);
    return createServerErrorResponse();
  }
}
