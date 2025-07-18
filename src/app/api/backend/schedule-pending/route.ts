import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/drizzle";
import { wakatimePendingHeartbeats } from "@/lib/database/drizzle/schema/wakatime";
import { wakatimeApiClient } from "@/lib/backend/client/wakatime";
import { wakapiClient } from "@/lib/backend/client/wakapi";
import { and, eq } from "drizzle-orm";
import {
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/api-responses";

// POST /v1/backend/schedule-pending
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const userAgent = request.headers.get("user-agent");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    if (token !== process.env.POSTGRES_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid authorization token" },
        { status: 401 },
      );
    }

    if (!userAgent?.includes("pg_net")) {
      return NextResponse.json(
        { error: "Invalid user agent" },
        { status: 401 },
      );
    }

    const pendingHeartbeats = await db
      .select()
      .from(wakatimePendingHeartbeats)
      .limit(100);

    if (pendingHeartbeats.length === 0) {
      return createSuccessResponse(
        { message: "No pending heartbeats to process", processed: 0 },
        200,
      );
    }

    const userHeartbeats = new Map<string, typeof pendingHeartbeats>();
    pendingHeartbeats.forEach((heartbeat) => {
      if (!userHeartbeats.has(heartbeat.userId)) {
        userHeartbeats.set(heartbeat.userId, []);
      }
      userHeartbeats.get(heartbeat.userId)!.push(heartbeat);
    });

    let totalProcessed = 0;
    const processedIds: string[] = [];

    for (const [userId, heartbeats] of userHeartbeats) {
      try {
        const wakatimeHeartbeats = heartbeats.map((h) => ({
          time: h.time,
          entity: h.entity,
          type: h.type,
          category: h.category,
          project: h.project,
          project_root_count: h.projectRootCount,
          branch: h.branch,
          language: h.language,
          dependencies: h.dependencies,
          lines: h.lines,
          line_additions: h.lineAdditions,
          line_deletions: h.lineDeletions,
          lineno: h.lineno,
          cursorpos: h.cursorpos,
          is_write: h.isWrite,
        }));

        const wakatimeSuccess = await wakatimeApiClient.sendHeartbeat(
          userId,
          wakatimeHeartbeats,
        );

        const wakapiResults = await wakapiClient.sendHeartbeatToAllInstances(
          userId,
          wakatimeHeartbeats,
        );

        // Process each heartbeat individually to update instances field
        for (const heartbeat of heartbeats) {
          const remainingInstances = heartbeat.instances || [];
          const successfulInstances: string[] = [];

          // Check if WakaTime succeeded
          if (wakatimeSuccess) {
            successfulInstances.push("wakatime");
          }

          // Add successful Wakapi instances (they are already instance IDs)
          wakapiResults.successful.forEach((instanceId) => {
            successfulInstances.push(instanceId);
          });

          // Remove successful instances from remaining instances
          const updatedInstances = remainingInstances.filter(
            (instance) => !successfulInstances.includes(instance),
          );

          if (updatedInstances.length === 0) {
            // All instances processed successfully, mark for deletion
            processedIds.push(heartbeat.id);
            totalProcessed++;
          } else {
            // Update the instances field with remaining instances
            await db
              .update(wakatimePendingHeartbeats)
              .set({ instances: updatedInstances })
              .where(eq(wakatimePendingHeartbeats.id, heartbeat.id));
          }
        }
      } catch (error) {
        console.error(`Error processing heartbeats for user ${userId}:`, error);
      }
    }

    // Remove successfully processed heartbeats
    if (processedIds.length > 0) {
      await db
        .delete(wakatimePendingHeartbeats)
        .where(
          and(
            ...processedIds.map((id) => eq(wakatimePendingHeartbeats.id, id)),
          ),
        );
    }

    return createSuccessResponse(
      {
        message: "Pending heartbeats processed",
        processed: totalProcessed,
        users: userHeartbeats.size,
      },
      200,
    );
  } catch (error) {
    console.error("Error in pending heartbeats scheduler:", error);
    return createServerErrorResponse();
  }
}

// GET /v1/backend/schedule-pending
export async function GET(request: NextRequest) {
  try {
    // Get count of pending heartbeats
    const count = await db
      .select()
      .from(wakatimePendingHeartbeats)
      .then((rows) => rows.length);

    return createSuccessResponse(
      {
        pending_count: count,
        status: "healthy",
      },
      200,
    );
  } catch (error) {
    console.error("Error checking pending heartbeats:", error);
    return createServerErrorResponse();
  }
}
