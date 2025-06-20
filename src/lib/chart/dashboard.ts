import { generateColorForProject, getOthersColor } from "./utils";

export type ProjectActivity = {
  projectName: string;
  minutes: number;
  color: string;
};

export type TimeEntry = {
  timestamp: string;
  projects: ProjectActivity[];
  total: number;
};

export type ProcessedChartData = {
  timestamp: string;
  [projectName: string]: number | string;
};

export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

export function processData(rawData: TimeEntry[]): {
  chartData: ProcessedChartData[];
  chartConfig: ChartConfig;
} {
  const projectTotals = new Map<string, { minutes: number; color: string }>();

  rawData.forEach((entry) => {
    entry.projects.forEach((project) => {
      const existing = projectTotals.get(project.projectName);
      if (existing) {
        existing.minutes += project.minutes;
      } else {
        projectTotals.set(project.projectName, {
          minutes: project.minutes,
          color: project.color,
        });
      }
    });
  });

  const sortedProjects = Array.from(projectTotals.entries()).sort(
    ([, a], [, b]) => b.minutes - a.minutes,
  );

  const top5Projects = sortedProjects.slice(0, 5);
  const otherProjects = sortedProjects.slice(5);

  const chartConfig: ChartConfig = {};

  if (otherProjects.length > 0) {
    chartConfig.Others = {
      label: "Others",
      color: getOthersColor(),
    };
  }

  top5Projects.forEach(([projectName, data]) => {
    chartConfig[projectName] = {
      label: projectName,
      color: data.color,
    };
  });

  const chartData: ProcessedChartData[] = rawData.map((entry) => {
    const dataPoint: ProcessedChartData = {
      timestamp: entry.timestamp,
    };

    if (otherProjects.length > 0) {
      dataPoint.Others = 0;
    }

    top5Projects.forEach(([projectName]) => {
      dataPoint[projectName] = 0;
    });

    entry.projects.forEach((project) => {
      const isTop5 = top5Projects.some(
        ([name]) => name === project.projectName,
      );

      if (isTop5) {
        dataPoint[project.projectName] =
          (dataPoint[project.projectName] as number) + project.minutes;
      } else if (otherProjects.length > 0) {
        dataPoint.Others = (dataPoint.Others as number) + project.minutes;
      }
    });

    return dataPoint;
  });

  return { chartData, chartConfig };
}

export function generateSampleData(): TimeEntry[] {
  const sampleProjects = [
    "Project 1",
    "Project 2",
    "Project 3",
    "Project 4",
    "Project 5",
    "Project 6",
    "Project 7",
    "Project 8",
    "Project 9",
    "Project 10",
  ];

  const projectColors = new Map(
    sampleProjects.map((project) => [
      project,
      generateColorForProject(project),
    ]),
  );

  const data: TimeEntry[] = [];
  const now = new Date();

  let currentProject = sampleProjects[0];
  let projectSwitchCooldown = 0;

  for (let i = 1440; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 1000);
    const hour = timestamp.getHours();

    let isActivelyCoding = false;
    let codingIntensity = 0;

    if (hour >= 9 && hour <= 17) {
      isActivelyCoding = Math.random() < 0.8;
      codingIntensity = 0.8;
    } else if (hour >= 19 && hour <= 22) {
      isActivelyCoding = Math.random() < 0.5;
      codingIntensity = 0.6;
    } else if (hour >= 6 && hour <= 8) {
      isActivelyCoding = Math.random() < 0.3;
      codingIntensity = 0.4;
    } else {
      isActivelyCoding = Math.random() < 0.1;
      codingIntensity = 0.3;
    }

    const projects: ProjectActivity[] = [];
    let totalMinutes = 0;

    if (isActivelyCoding) {
      if (projectSwitchCooldown <= 0 && Math.random() < 0.05) {
        currentProject =
          sampleProjects[Math.floor(Math.random() * sampleProjects.length)];
        projectSwitchCooldown = 15 + Math.floor(Math.random() * 30);
      }

      if (projectSwitchCooldown > 0) {
        projectSwitchCooldown--;
      }

      const baseActivity = 0.3 + Math.random() * 0.7;
      const actualActivity = baseActivity * codingIntensity;
      const minutes = Math.round(actualActivity * 100) / 100;

      if (minutes > 0.05) {
        projects.push({
          projectName: currentProject,
          minutes,
          color: projectColors.get(currentProject)!,
        });
        totalMinutes = minutes;
      }
    }

    data.push({
      timestamp: timestamp.toISOString(),
      projects,
      total: totalMinutes,
    });
  }

  return data;
}

export function calculateTotalTime(data: TimeEntry[]): number {
  return data.reduce((total, entry) => total + entry.total, 0);
}

export function getProjectStats(data: TimeEntry[]): Array<{
  projectName: string;
  totalMinutes: number;
  percentage: number;
  color: string;
}> {
  const projectTotals = new Map<string, { minutes: number; color: string }>();
  let grandTotal = 0;

  data.forEach((entry) => {
    entry.projects.forEach((project) => {
      const existing = projectTotals.get(project.projectName);
      if (existing) {
        existing.minutes += project.minutes;
      } else {
        projectTotals.set(project.projectName, {
          minutes: project.minutes,
          color: project.color,
        });
      }
      grandTotal += project.minutes;
    });
  });

  return Array.from(projectTotals.entries())
    .map(([projectName, data]) => ({
      projectName,
      totalMinutes: data.minutes,
      percentage: grandTotal > 0 ? (data.minutes / grandTotal) * 100 : 0,
      color: data.color,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}
