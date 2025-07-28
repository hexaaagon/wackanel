import { heartbeatService } from "@/lib/backend/services/heartbeat";
import type {
  ProcessedChartData,
  ChartConfig,
} from "@/lib/app/site/chart/dashboard";

export interface HeartbeatChartData {
  chartData: ProcessedChartData[];
  chartConfig: ChartConfig;
  totalActivity: number;
  generatedAt: string;
}

/**
 * Convert heartbeat activity data to dashboard chart format
 */
export async function getHeartbeatChartData(
  userId: string,
  hours: number = 24,
): Promise<HeartbeatChartData> {
  const activity = await heartbeatService.getRecentActivity(userId, hours);

  // Get project colors (you might want to store these in DB later)
  const projectColors = new Map<string, string>();
  const colorPalette = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
    "#F97316",
    "#84CC16",
    "#EC4899",
    "#6366F1",
  ];

  let colorIndex = 0;
  const allProjects = new Set<string>();

  // Collect all projects
  activity.forEach((slot) => {
    slot.projects.forEach((project) => {
      allProjects.add(project.name);
    });
  });

  // Assign colors to projects
  Array.from(allProjects).forEach((project) => {
    projectColors.set(project, colorPalette[colorIndex % colorPalette.length]);
    colorIndex++;
  });

  // Calculate totals for top projects
  const projectTotals = new Map<string, number>();
  activity.forEach((slot) => {
    slot.projects.forEach((project) => {
      projectTotals.set(
        project.name,
        (projectTotals.get(project.name) || 0) + project.seconds,
      );
    });
  });

  // Get top 5 projects
  const sortedProjects = Array.from(projectTotals.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const top5Projects = sortedProjects.map(([name]) => name);
  const otherProjects = Array.from(allProjects).filter(
    (p) => !top5Projects.includes(p),
  );

  // Build chart config
  const chartConfig: ChartConfig = {};

  top5Projects.forEach((project) => {
    chartConfig[project] = {
      label: project,
      color: projectColors.get(project) || "#6B7280",
    };
  });

  if (otherProjects.length > 0) {
    chartConfig.Others = {
      label: "Others",
      color: "#9CA3AF",
    };
  }

  // Convert to chart data format
  const chartData: ProcessedChartData[] = activity.map((slot) => {
    const dataPoint: ProcessedChartData = {
      timestamp: new Date(slot.timeSlot * 1000).toISOString(),
    };

    // Initialize all projects to 0
    top5Projects.forEach((project) => {
      dataPoint[project] = 0;
    });

    if (otherProjects.length > 0) {
      dataPoint.Others = 0;
    }

    // Fill in actual data
    slot.projects.forEach((project) => {
      const minutes = project.seconds / 60; // Convert to minutes for chart

      if (top5Projects.includes(project.name)) {
        dataPoint[project.name] = Math.round(minutes * 100) / 100;
      } else if (otherProjects.length > 0) {
        dataPoint.Others =
          (dataPoint.Others as number) + Math.round(minutes * 100) / 100;
      }
    });

    return dataPoint;
  });

  // Calculate total activity
  const totalActivity = Math.round(
    activity.reduce((sum, slot) => sum + slot.totalSeconds / 60, 0),
  );

  return {
    chartData,
    chartConfig,
    totalActivity,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get statistics summary for dashboard
 */
export async function getHeartbeatSummary(
  userId: string,
  hours: number = 24,
): Promise<{
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  projectCount: number;
  languageCount: number;
  mostActiveProject: string | null;
  mostActiveLanguage: string | null;
}> {
  const now = Math.floor(Date.now() / 1000);
  const start = now - hours * 3600;

  const stats = await heartbeatService.getHeartbeatStats(userId, start, now);

  return {
    totalSeconds: stats.totalSeconds,
    totalMinutes: Math.round(stats.totalSeconds / 60),
    totalHours: Math.round((stats.totalSeconds / 3600) * 100) / 100,
    projectCount: stats.projects.length,
    languageCount: stats.languages.length,
    mostActiveProject:
      stats.projects.length > 0 ? stats.projects[0].name : null,
    mostActiveLanguage:
      stats.languages.length > 0 ? stats.languages[0].name : null,
  };
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${remainingSeconds}s`;
  }
}

/**
 * Get color for project (deterministic based on name)
 */
export function getProjectColor(projectName: string): string {
  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
    "#F97316",
    "#84CC16",
    "#EC4899",
    "#6366F1",
  ];

  // Simple hash function to get consistent color for project name
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    const char = projectName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return colors[Math.abs(hash) % colors.length];
}
