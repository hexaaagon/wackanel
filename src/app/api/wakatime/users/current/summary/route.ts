import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db_drizzle";
import { wakatimeHeartbeats } from "@/lib/db_drizzle/schema/wakatime";
import { validateApiKey } from "@/lib/auth/api-key-validator";
import { eq, and, gte, lte } from "drizzle-orm";
import { summaryQuerySchema } from "@/shared/schemas/wakatime";
import {
  createValidationErrorResponse,
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/misc/utils/api-responses";

// GET /api/wakatime/users/current/summary
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

    const url = new URL(request.url);
    const queryParams = {
      start: url.searchParams.get("start"),
      end: url.searchParams.get("end"),
      range: url.searchParams.get("range"),
      project: url.searchParams.get("project"),
      branches: url.searchParams.get("branches"),
      timeout: url.searchParams.get("timeout")
        ? parseInt(url.searchParams.get("timeout")!)
        : undefined,
      writes_only: url.searchParams.get("writes_only") === "true",
      timezone: url.searchParams.get("timezone"),
    };

    const cleanedParams = Object.fromEntries(
      Object.entries(queryParams).filter(
        ([_, value]) => value !== null && value !== undefined,
      ),
    );

    const validationResult = summaryQuerySchema.safeParse(cleanedParams);
    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        "Invalid query parameters",
      );
    }

    const {
      start,
      end,
      range,
      project,
      branches,
      timeout,
      writes_only,
      timezone,
    } = validationResult.data;

    // Calculate date range
    let startDate: Date;
    let endDate: Date = new Date();

    if (start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
    } else if (range) {
      endDate = new Date();
      switch (range) {
        case "last_7_days":
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "last_30_days":
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "last_6_months":
          startDate = new Date(
            endDate.getTime() - 6 * 30 * 24 * 60 * 60 * 1000,
          );
          break;
        case "last_year":
          startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    } else {
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    const heartbeats = await db
      .select()
      .from(wakatimeHeartbeats)
      .where(
        and(
          eq(wakatimeHeartbeats.userId, userId),
          gte(wakatimeHeartbeats.timeSlot, startTimestamp),
          lte(wakatimeHeartbeats.timeSlot, endTimestamp),
        ),
      );

    const dailyData = new Map<
      string,
      {
        date: string;
        total_seconds: number;
        projects: Map<string, number>;
        languages: Map<string, number>;
        categories: Map<string, number>;
        editors: Map<string, number>;
      }
    >();

    heartbeats.forEach((heartbeat) => {
      const date = new Date(heartbeat.timeSlot * 1000);
      const dateStr = date.toISOString().split("T")[0];

      if (!dailyData.has(dateStr)) {
        dailyData.set(dateStr, {
          date: dateStr,
          total_seconds: 0,
          projects: new Map(),
          languages: new Map(),
          categories: new Map(),
          editors: new Map(),
        });
      }

      const day = dailyData.get(dateStr)!;
      day.total_seconds += heartbeat.totalSeconds || 0;

      if (heartbeat.project) {
        day.projects.set(
          heartbeat.project,
          (day.projects.get(heartbeat.project) || 0) +
            (heartbeat.totalSeconds || 0),
        );
      }
      if (heartbeat.language) {
        day.languages.set(
          heartbeat.language,
          (day.languages.get(heartbeat.language) || 0) +
            (heartbeat.totalSeconds || 0),
        );
      }
      if (heartbeat.category) {
        day.categories.set(
          heartbeat.category,
          (day.categories.get(heartbeat.category) || 0) +
            (heartbeat.totalSeconds || 0),
        );
      }
      if (heartbeat.editor) {
        day.editors.set(
          heartbeat.editor,
          (day.editors.get(heartbeat.editor) || 0) +
            (heartbeat.totalSeconds || 0),
        );
      }
    });

    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      if (hours > 0) {
        return `${hours} hr${hours !== 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`;
      } else {
        return `${minutes} min${minutes !== 1 ? "s" : ""}`;
      }
    };

    const formatStats = (
      statsMap: Map<string, number>,
      totalSeconds: number,
    ) => {
      return Array.from(statsMap.entries())
        .map(([name, seconds]) => ({
          name,
          total_seconds: seconds,
          percent:
            totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0,
          digital: formatTime(seconds),
          text: formatTime(seconds),
          hours: Math.floor(seconds / 3600),
          minutes: Math.floor((seconds % 3600) / 60),
        }))
        .sort((a, b) => b.total_seconds - a.total_seconds);
    };

    const data = Array.from(dailyData.values()).map((day) => ({
      grand_total: {
        digital: formatTime(day.total_seconds),
        hours: Math.floor(day.total_seconds / 3600),
        minutes: Math.floor((day.total_seconds % 3600) / 60),
        text: formatTime(day.total_seconds),
        total_seconds: day.total_seconds,
      },
      projects: formatStats(day.projects, day.total_seconds),
      languages: formatStats(day.languages, day.total_seconds),
      categories: formatStats(day.categories, day.total_seconds),
      editors: formatStats(day.editors, day.total_seconds),
      operating_systems: [],
      dependencies: [],
      range: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        date: day.date,
        text: day.date,
        timezone: "UTC",
      },
    }));

    return createSuccessResponse({
      data,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      status: "ok",
    });
  } catch (error) {
    console.error("Error in summary endpoint:", error);
    return createServerErrorResponse();
  }
}
