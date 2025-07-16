import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db_drizzle";
import { wakatimePendingHeartbeats } from "@/lib/db_drizzle/schema/wakatime";
import { validateApiKey } from "@/lib/auth/api-key-validator";
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

    const userId = apiKeyValidation.userId!;

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

    const processedHeartbeats = [];
    for (const heartbeat of heartbeats) {
      try {
        const pendingHeartbeat = await db
          .insert(wakatimePendingHeartbeats)
          .values({
            userId: userId,
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
          .returning();

        processedHeartbeats.push(pendingHeartbeat[0]);
      } catch (error) {
        console.error("Error processing heartbeat:", error);
      }
    }

    return createSuccessResponse(
      {
        responses: processedHeartbeats.map(() => ({
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
