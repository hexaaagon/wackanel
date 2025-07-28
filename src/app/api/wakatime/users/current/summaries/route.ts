import { NextRequest, NextResponse } from "next/server";
import { validateWakatimeApiAuth } from "@/lib/auth/wakatime-api-auth";
import { heartbeatService } from "@/lib/backend/services/heartbeat";
import { summaryQuerySchema } from "@/shared/schemas/wakatime";
import {
  createValidationErrorResponse,
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/api-responses";

// GET /api/wakatime/users/current/summaries
export async function GET(request: NextRequest) {
  try {
    // Validate authentication (supports both API key and session)
    const authResult = await validateWakatimeApiAuth(request);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error);
    }

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

    const params = validationResult.data;
    let startTime: number | undefined;
    let endTime: number | undefined;

    // Handle range parameter
    if (params.range) {
      const now = Math.floor(Date.now() / 1000);
      switch (params.range) {
        case "last_7_days":
          startTime = now - 7 * 24 * 3600;
          endTime = now;
          break;
        case "last_30_days":
          startTime = now - 30 * 24 * 3600;
          endTime = now;
          break;
        case "last_6_months":
          startTime = now - 6 * 30 * 24 * 3600;
          endTime = now;
          break;
        case "last_year":
          startTime = now - 365 * 24 * 3600;
          endTime = now;
          break;
      }
    } else {
      // Handle start/end parameters
      if (params.start) {
        startTime = Math.floor(new Date(params.start).getTime() / 1000);
      }
      if (params.end) {
        // End of day for end date
        endTime = Math.floor(
          new Date(params.end + "T23:59:59Z").getTime() / 1000,
        );
      }
    }

    // Default to today if no time range specified
    if (!startTime && !endTime) {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const todayEnd = new Date(todayStart.getTime() + 86400000 - 1); // End of day

      startTime = Math.floor(todayStart.getTime() / 1000);
      endTime = Math.floor(todayEnd.getTime() / 1000);
    }

    const stats = await heartbeatService.getHeartbeatStats(
      authResult.userId,
      startTime,
      endTime,
    );

    // Format dates for response
    const startDate = startTime
      ? new Date(startTime * 1000).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    const endDate = endTime
      ? new Date(endTime * 1000).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    return createSuccessResponse({
      data: [
        {
          grand_total: {
            digital: formatDuration(stats.totalSeconds),
            hours: Math.floor(stats.totalSeconds / 3600),
            minutes: Math.floor((stats.totalSeconds % 3600) / 60),
            text: formatDuration(stats.totalSeconds),
            total_seconds: stats.totalSeconds,
          },
          projects: stats.projects.map((p) => ({
            name: p.name,
            total_seconds: p.seconds,
            percent: p.percentage,
            digital: formatDuration(p.seconds),
            text: formatDuration(p.seconds),
            hours: Math.floor(p.seconds / 3600),
            minutes: Math.floor((p.seconds % 3600) / 60),
          })),
          languages: stats.languages.map((l) => ({
            name: l.name,
            total_seconds: l.seconds,
            percent: l.percentage,
            digital: formatDuration(l.seconds),
            text: formatDuration(l.seconds),
            hours: Math.floor(l.seconds / 3600),
            minutes: Math.floor((l.seconds % 3600) / 60),
          })),
          categories: stats.categories.map((c) => ({
            name: c.name,
            total_seconds: c.seconds,
            percent: c.percentage,
            digital: formatDuration(c.seconds),
            text: formatDuration(c.seconds),
            hours: Math.floor(c.seconds / 3600),
            minutes: Math.floor((c.seconds % 3600) / 60),
          })),
          editors: [], // TODO: Add editor tracking
          operating_systems: [], // TODO: Add OS tracking
          dependencies: [], // TODO: Add dependency tracking
          machines: [], // TODO: Add machine tracking
          range: {
            start: startDate,
            end: endDate,
            date: startDate,
            text: params.range || "custom",
            timezone: params.timezone || "UTC",
          },
        },
      ],
      start: startDate,
      end: endDate,
      status: "ok" as const,
    });

    function formatDuration(seconds: number): string {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      } else {
        return `${remainingSeconds}s`;
      }
    }
  } catch (error) {
    console.error("Error in summary endpoint:", error);
    return createServerErrorResponse();
  }
}
