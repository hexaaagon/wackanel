import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/drizzle";
import { wakatimePendingHeartbeats } from "@/lib/database/drizzle/schema/wakatime";
import { validateApiKey } from "@/lib/auth/api-key-validator";
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

    const forwardingPromises = [];

    forwardingPromises.push(
      wakatimeApiClient
        .sendHeartbeat(user.userId, heartbeats)
        .then((success) => ({ service: "wakatime", success }))
        .catch((error) => {
          console.error("Error forwarding to WakaTime:", error);
          return { service: "wakatime", success: false };
        }),
    );

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

    const forwardingResults = await Promise.all(forwardingPromises);

    // Check if any forwarding succeeded
    const anySucceeded = forwardingResults.some((result) => result.success);

    if (!anySucceeded) {
      console.log("All forwarding attempts failed, storing in pending table");

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
            instances: targetInstances,
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
    console.error("Error in heartbeats endpoint:", error);
    return createServerErrorResponse();
  }
}
