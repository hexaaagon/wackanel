import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db_drizzle";
import { wakatimeHeartbeats } from "@/lib/db_drizzle/schema/wakatime";
import { validateApiKey } from "@/lib/auth/api-key-validator";
import { eq, and, gte } from "drizzle-orm";
import {
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/misc/utils/api-responses";

// GET /api/wakatime/users/current/statusbar/today
export async function GET(request: NextRequest) {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);

    const todayHeartbeats = await db
      .select()
      .from(wakatimeHeartbeats)
      .where(
        and(
          eq(wakatimeHeartbeats.userId, userId),
          gte(wakatimeHeartbeats.timeSlot, todayTimestamp),
        ),
      );

    const totalSeconds = todayHeartbeats.reduce(
      (sum, heartbeat) => sum + (heartbeat.totalSeconds || 0),
      0,
    );

    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      } else {
        return `${remainingSeconds}s`;
      }
    };

    const recentHeartbeat = todayHeartbeats.sort(
      (a, b) => (b.timeSlot || 0) - (a.timeSlot || 0),
    )[0];

    return createSuccessResponse({
      data: {
        cached_at: new Date().toISOString(),
        decimal: (totalSeconds / 3600).toFixed(2),
        digital: formatTime(totalSeconds),
        percent: totalSeconds > 0 ? 100 : 0,
        text: formatTime(totalSeconds),
        timeout: 15,
        total_seconds: totalSeconds,
        project: recentHeartbeat?.project || null,
        category: recentHeartbeat?.category || null,
        language: recentHeartbeat?.language || null,
        is_coding: totalSeconds > 0,
      },
    });
  } catch (error) {
    console.error("Error in statusbar/today endpoint:", error);
    return createServerErrorResponse();
  }
}
