import { NextRequest, NextResponse } from "next/server";
import { validateWakatimeApiAuth } from "@/lib/auth/wakatime-api-auth";
import { heartbeatService } from "@/lib/backend/services/heartbeat";
import {
  createAuthErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/api-responses";

// GET /api/wakatime/users/current/statusbar/today
export async function GET(request: NextRequest) {
  try {
    // Validate authentication (supports both API key and session)
    const authResult = await validateWakatimeApiAuth(request);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error);
    }

    // Get today's stats
    const now = Math.floor(Date.now() / 1000);
    const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

    const stats = await heartbeatService.getHeartbeatStats(
      authResult.userId,
      todayStart,
      now,
    );

    const today = new Date();
    const todayDateStr = today.toISOString().split("T")[0];
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    return createSuccessResponse({
      cached_at: new Date().toISOString(),
      data: {
        categories: stats.categories.map((cat) => ({
          decimal: (cat.seconds / 3600).toFixed(2),
          digital: formatDigitalTime(cat.seconds),
          hours: Math.floor(cat.seconds / 3600),
          minutes: Math.floor((cat.seconds % 3600) / 60),
          name: cat.name,
          percent: cat.percentage,
          seconds: cat.seconds % 60,
          text: formatDuration(cat.seconds),
          total_seconds: cat.seconds,
        })),
        dependencies:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (stats as any).dependencies?.map((dep: any) => ({
            decimal: (dep.seconds / 3600).toFixed(2),
            digital: formatDigitalTime(dep.seconds),
            hours: Math.floor(dep.seconds / 3600),
            minutes: Math.floor((dep.seconds % 3600) / 60),
            name: dep.name,
            percent: dep.percentage,
            seconds: dep.seconds % 60,
            text: formatDuration(dep.seconds),
            total_seconds: dep.seconds,
          })) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editors: (stats as any).editors?.map((editor: any) => ({
          decimal: (editor.seconds / 3600).toFixed(2),
          digital: formatDigitalTime(editor.seconds),
          hours: Math.floor(editor.seconds / 3600),
          minutes: Math.floor((editor.seconds % 3600) / 60),
          name: editor.name,
          percent: editor.percentage,
          seconds: editor.seconds % 60,
          text: formatDuration(editor.seconds),
          total_seconds: editor.seconds,
        })) || [
          {
            decimal: (stats.totalSeconds / 3600).toFixed(2),
            digital: formatDigitalTime(stats.totalSeconds),
            hours: Math.floor(stats.totalSeconds / 3600),
            minutes: Math.floor((stats.totalSeconds % 3600) / 60),
            name: "Unknown Editor",
            percent: 100,
            seconds: stats.totalSeconds % 60,
            text: formatDuration(stats.totalSeconds),
            total_seconds: stats.totalSeconds,
          },
        ],
        grand_total: {
          decimal: (stats.totalSeconds / 3600).toFixed(2),
          digital: formatDigitalTime(stats.totalSeconds),
          hours: Math.floor(stats.totalSeconds / 3600),
          minutes: Math.floor((stats.totalSeconds % 3600) / 60),
          text: formatDuration(stats.totalSeconds),
          total_seconds: stats.totalSeconds,
        },
        languages: stats.languages.map((lang) => ({
          decimal: (lang.seconds / 3600).toFixed(2),
          digital: formatDigitalTime(lang.seconds),
          hours: Math.floor(lang.seconds / 3600),
          minutes: Math.floor((lang.seconds % 3600) / 60),
          name: lang.name,
          percent: lang.percentage,
          seconds: lang.seconds % 60,
          text: formatDuration(lang.seconds),
          total_seconds: lang.seconds,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        machines: (stats as any).machines?.map((machine: any) => ({
          decimal: (machine.seconds / 3600).toFixed(2),
          digital: formatDigitalTime(machine.seconds),
          hours: Math.floor(machine.seconds / 3600),
          machine_name_id: machine.id || "unknown",
          minutes: Math.floor((machine.seconds % 3600) / 60),
          name: machine.name,
          percent: machine.percentage,
          seconds: machine.seconds % 60,
          text: formatDuration(machine.seconds),
          total_seconds: machine.seconds,
        })) || [
          {
            decimal: (stats.totalSeconds / 3600).toFixed(2),
            digital: formatDigitalTime(stats.totalSeconds),
            hours: Math.floor(stats.totalSeconds / 3600),
            machine_name_id: "unknown",
            minutes: Math.floor((stats.totalSeconds % 3600) / 60),
            name: "Unknown Hostname",
            percent: 100,
            seconds: stats.totalSeconds % 60,
            text: formatDuration(stats.totalSeconds),
            total_seconds: stats.totalSeconds,
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        operating_systems: (stats as any).operatingSystems?.map((os: any) => ({
          decimal: (os.seconds / 3600).toFixed(2),
          digital: formatDigitalTime(os.seconds),
          hours: Math.floor(os.seconds / 3600),
          minutes: Math.floor((os.seconds % 3600) / 60),
          name: os.name,
          percent: os.percentage,
          seconds: os.seconds % 60,
          text: formatDuration(os.seconds),
          total_seconds: os.seconds,
        })) || [
          {
            decimal: (stats.totalSeconds / 3600).toFixed(2),
            digital: formatDigitalTime(stats.totalSeconds),
            hours: Math.floor(stats.totalSeconds / 3600),
            minutes: Math.floor((stats.totalSeconds % 3600) / 60),
            name: "Unknown OS",
            percent: 100,
            seconds: stats.totalSeconds % 60,
            text: formatDuration(stats.totalSeconds),
            total_seconds: stats.totalSeconds,
          },
        ],
        projects: stats.projects.map((proj) => ({
          decimal: (proj.seconds / 3600).toFixed(2),
          digital: formatDigitalTime(proj.seconds),
          hours: Math.floor(proj.seconds / 3600),
          minutes: Math.floor((proj.seconds % 3600) / 60),
          name: proj.name,
          percent: proj.percentage,
          seconds: proj.seconds % 60,
          text: formatDuration(proj.seconds),
          total_seconds: proj.seconds,
        })),
        range: {
          date: todayDateStr,
          end: endOfDay.toISOString(),
          start: startOfDay.toISOString(),
          text: today.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
      has_team_features: false,
    });
  } catch (error) {
    console.error("Error in statusbar/today endpoint:", error);
    return createServerErrorResponse();
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

function formatDigitalTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
