"use client";
import { useState, useEffect, useMemo, JSX } from "react";

import {
  Bar,
  Line,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceArea,
  TooltipProps,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  type ProcessedChartData,
  type ChartConfig as DashboardChartConfig,
} from "@/lib/app/site/chart/dashboard";

interface DashboardStatsProps {
  chartData: ProcessedChartData[];
  chartConfig: DashboardChartConfig;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  chartConfig: DashboardChartConfig & {
    totalActivity: { label: string; color: string };
  };
  timeRange: string;
  totalDataPoints: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  chartConfig,
  timeRange,
  totalDataPoints,
}) => {
  if (!active || !payload || !label) return null;

  const date = new Date(label);

  const totalMinutes =
    timeRange === "24h"
      ? 1440
      : timeRange === "12h"
        ? 720
        : timeRange === "6h"
          ? 360
          : timeRange === "3h"
            ? 180
            : 60;
  const minutesPerPoint = Math.round(totalMinutes / totalDataPoints);

  const timeFormat =
    minutesPerPoint < 60
      ? {
          hour: "numeric" as const,
          minute: "2-digit" as const,
          hour12: true,
        }
      : {
          hour: "numeric" as const,
          hour12: true,
        };

  const startTime = date.toLocaleTimeString("en-US", timeFormat);

  const now = new Date();
  const calculatedEndDate = new Date(
    date.getTime() + minutesPerPoint * 60 * 1000,
  );
  const endDate = calculatedEndDate > now ? now : calculatedEndDate;

  const endTime = endDate.toLocaleTimeString("en-US", timeFormat);

  const formattedDate = date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const validItems = payload
    .filter((item) => item.value && item.value > 0)
    .sort((a, b) => (b.value as number) - (a.value as number));

  if (validItems.length === 0) return null;

  const totalActivityItem = validItems.find(
    (item) => item.dataKey === "totalActivity",
  );
  const projectItems = validItems.filter(
    (item) => item.dataKey !== "totalActivity",
  );

  return (
    <div className="rounded-base border-border bg-background shadow-shadow font-base min-w-[220px] border-2">
      <div className="border-border border-b-2 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-heading text-foreground text-sm">
              {formattedDate}
            </div>
            <div className="text-muted-foreground text-xs">
              {startTime} - {endTime}
            </div>
          </div>
          {totalActivityItem && (
            <div className="text-right">
              <div className="text-foreground text-xs font-bold">
                {Math.round(totalActivityItem.value as number)} min
                {Math.round(totalActivityItem.value as number) > 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>
      </div>
      {projectItems.length > 0 && (
        <div className="space-y-2 px-4 py-3">
          {projectItems.map((item, index) => {
            const config = chartConfig[item.dataKey as string];

            return (
              <div
                key={index}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm border border-gray-400"
                    style={{ backgroundColor: config?.color || "#ccc" }}
                  ></div>
                  <span className="text-foreground truncate text-xs">
                    {config?.label || item.dataKey}
                  </span>
                </div>
                <span className="text-foreground text-xs font-medium whitespace-nowrap">
                  {Math.round((item.value as number) * 100) / 100} min
                  {Math.round((item.value as number) * 100) / 100 > 1
                    ? "s"
                    : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface CustomLegendContentProps {
  chartConfig: DashboardChartConfig & {
    totalActivity: { label: string; color: string };
  };
  payload?: Array<{
    value: string;
    type: string;
    color: string;
    dataKey: string;
  }>;
  responsiveData: ProcessedChartData[];
}

const CustomLegendContent: React.FC<CustomLegendContentProps> = ({
  chartConfig,
  payload,
  responsiveData,
}) => {
  if (!payload || payload.length === 0) return null;

  const projectsWithData = new Set<string>();
  responsiveData.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (
        key !== "timestamp" &&
        key !== "totalActivity" &&
        item[key] &&
        (item[key] as number) > 0
      ) {
        projectsWithData.add(key);
      }
    });
  });

  const uniqueEntries = new Map();
  payload.forEach((entry) => {
    if (!uniqueEntries.has(entry.dataKey)) {
      uniqueEntries.set(entry.dataKey, entry);
    }
  });

  const projectEntries = Array.from(uniqueEntries.values())
    .filter(
      (e) =>
        e.dataKey !== "Others" &&
        e.dataKey !== "totalActivity" &&
        projectsWithData.has(e.dataKey),
    )
    .sort((a, b) => {
      const aLabel = (chartConfig[a.dataKey]?.label || a.dataKey).toString();
      const bLabel = (chartConfig[b.dataKey]?.label || b.dataKey).toString();
      return aLabel.localeCompare(bLabel);
    });

  const utilityEntries = Array.from(uniqueEntries.values()).filter((e) => {
    if (e.dataKey === "totalActivity") return true;
    if (e.dataKey === "Others") {
      return projectsWithData.has("Others");
    }
    return false;
  });

  const hasYesterdayData = () => {
    if (!responsiveData || responsiveData.length === 0) return false;

    const now = new Date();
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();

    return responsiveData.some((item) => {
      const itemTime = new Date(item.timestamp).getTime();
      return itemTime < todayMidnight;
    });
  };

  return (
    <>
      {hasYesterdayData() && <>* Gray area indicates yesterday</>}
      <div className="flex flex-wrap items-center justify-center gap-x-4 text-sm">
        {projectEntries.map((entry) => {
          const config = chartConfig[entry.dataKey];
          const isTotal = entry.dataKey === "totalActivity";

          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              {isTotal ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  className="flex-shrink-0"
                >
                  <line
                    x1="1"
                    y1="8"
                    x2="15"
                    y2="8"
                    stroke={config?.color || entry.color}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-sm border border-gray-400"
                  style={{ backgroundColor: config?.color || entry.color }}
                />
              )}
              <span className="text-foreground text-xs font-medium">
                {config?.label || entry.dataKey}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 text-sm">
        {utilityEntries.map((entry) => {
          const config = chartConfig[entry.dataKey];
          const isTotal = entry.dataKey === "totalActivity";

          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              {isTotal ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  className="flex-shrink-0"
                >
                  <line
                    x1="1"
                    y1="8"
                    x2="15"
                    y2="8"
                    stroke={config?.color || entry.color}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <div
                  className="h-3 w-3 flex-shrink-0 rounded-sm border border-gray-400"
                  style={{ backgroundColor: config?.color || entry.color }}
                />
              )}
              <span className="text-foreground text-xs font-medium">
                {config?.label || entry.dataKey}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const aggregateDataForScreen = (
  data: ProcessedChartData[],
  screenWidth: number,
  timeRange: string,
): ProcessedChartData[] => {
  let targetDataPoints: number;

  if (screenWidth < 640) {
    targetDataPoints = 6;
  } else if (screenWidth < 1024) {
    targetDataPoints = 12;
  } else if (screenWidth < 1440) {
    targetDataPoints = 18;
  } else {
    targetDataPoints = 24;
  }

  if (data.length <= targetDataPoints) {
    return data;
  }

  const groupSize = Math.ceil(data.length / targetDataPoints);
  const aggregatedData: ProcessedChartData[] = [];

  for (let i = 0; i < data.length; i += groupSize) {
    const group = data.slice(i, i + groupSize);
    if (group.length === 0) continue;

    const aggregatedPoint: ProcessedChartData = {
      timestamp: group[group.length - 1].timestamp,
    };

    const projectKeys = Object.keys(group[0]).filter(
      (key) => key !== "timestamp",
    );

    let totalActivity = 0;
    projectKeys.forEach((projectKey) => {
      const total = group.reduce(
        (sum, item) => sum + ((item[projectKey] as number) || 0),
        0,
      );
      const roundedTotal = Math.round(total * 100) / 100;
      aggregatedPoint[projectKey] = roundedTotal;
      totalActivity += roundedTotal;
    });

    aggregatedPoint.totalActivity = Math.round(totalActivity * 100) / 100;

    aggregatedData.push(aggregatedPoint);
  }

  return aggregatedData;
};

const darkenColor = (color: string, factor: number = 0.7): string => {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

const fixDuplicateColors = (
  config: DashboardChartConfig,
): DashboardChartConfig => {
  const usedColors = new Map<string, string[]>();
  const updatedConfig = { ...config };

  Object.entries(config).forEach(([projectName, projectConfig]) => {
    const color = projectConfig.color;
    if (!usedColors.has(color)) {
      usedColors.set(color, []);
    }
    usedColors.get(color)!.push(projectName);
  });

  usedColors.forEach((projectNames, color) => {
    if (projectNames.length > 1) {
      projectNames.slice(1).forEach((projectName, index) => {
        const darkenFactor = 0.7 - index * 0.15;
        updatedConfig[projectName] = {
          ...updatedConfig[projectName],
          color: darkenColor(color, Math.max(darkenFactor, 0.3)),
        };
      });
    }
  });

  return updatedConfig;
};

export function ChartAreaInteractive({
  timeRange,
  setTimeRange,
  filteredData,
  chartConfig,
}: {
  timeRange: string;
  setTimeRange: (value: string) => void;
  filteredData: ProcessedChartData[];
  chartConfig: DashboardChartConfig;
}) {
  const { width } = useWindowSize();

  const responsiveData = useMemo(
    () => aggregateDataForScreen(filteredData, width, timeRange),
    [filteredData, width, timeRange],
  );

  const timeRangeLabel = useMemo(
    () =>
      timeRange === "24h"
        ? "24 hours"
        : timeRange === "12h"
          ? "12 hours"
          : timeRange === "6h"
            ? "6 hours"
            : timeRange === "3h"
              ? "3 hours"
              : "60 minutes",
    [timeRange],
  );

  const getGranularityDescription = () => {
    const dataPoints = responsiveData.length;
    const totalMinutes =
      timeRange === "24h"
        ? 1440
        : timeRange === "12h"
          ? 720
          : timeRange === "6h"
            ? 360
            : timeRange === "3h"
              ? 180
              : 60;
    const minutesPerPoint = Math.round(totalMinutes / dataPoints);

    if (minutesPerPoint >= 60) {
      const hours = Math.round(minutesPerPoint / 60);
      return `${hours}-hour interval${hours > 1 ? "s" : ""}`;
    } else {
      return `${minutesPerPoint}-minute interval${minutesPerPoint > 1 ? "s" : ""}`;
    }
  };

  const deduplicatedChartConfig = useMemo(
    () => fixDuplicateColors(chartConfig),
    [chartConfig],
  );

  const projectKeys = useMemo(
    () =>
      Object.keys(deduplicatedChartConfig).sort((a, b) => {
        const aLabel = (deduplicatedChartConfig[a]?.label || a).toString();
        const bLabel = (deduplicatedChartConfig[b]?.label || b).toString();
        return aLabel.localeCompare(bLabel);
      }),
    [deduplicatedChartConfig],
  );

  const enhancedChartConfig: DashboardChartConfig & {
    totalActivity: { label: string; color: string };
  } = useMemo(
    () => ({
      ...deduplicatedChartConfig,
      totalActivity: {
        label: "Total Activity",
        color: "#1f2937",
      },
    }),
    [deduplicatedChartConfig],
  );

  const getYesterdayArea = useMemo(() => {
    if (responsiveData.length === 0) return null;

    const now = new Date();
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();

    const firstTodayIndex = responsiveData.findIndex((item) => {
      const itemTime = new Date(item.timestamp).getTime();
      return itemTime >= todayMidnight;
    });

    if (firstTodayIndex > 0) {
      return {
        x1: responsiveData[0].timestamp,
        x2: responsiveData[firstTodayIndex - 1].timestamp,
      };
    }

    if (firstTodayIndex === -1) {
      const lastItemTime = new Date(
        responsiveData[responsiveData.length - 1].timestamp,
      ).getTime();
      if (lastItemTime < todayMidnight) {
        return {
          x1: responsiveData[0].timestamp,
          x2: responsiveData[responsiveData.length - 1].timestamp,
        };
      }
    }

    return null;
  }, [responsiveData]);

  const yesterdayArea = getYesterdayArea;

  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader className="flex flex-col items-center gap-4 space-y-0 sm:flex-row sm:gap-2">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Your Wakatime Activity - Last {timeRangeLabel}</CardTitle>
          <CardDescription>
            Your Wakatime activity over the last <b>{timeRangeLabel}</b> in{" "}
            <b>{getGranularityDescription()}</b>
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] bg-white sm:ml-auto"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Last 24 hours" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="12h">Last 12 hours</SelectItem>
            <SelectItem value="6h">Last 6 hours</SelectItem>
            <SelectItem value="3h">Last 3 hours</SelectItem>
            <SelectItem value="1h">Last 60 minutes</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={enhancedChartConfig as ChartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <ComposedChart
            key={`chart-${timeRange}-${responsiveData.length}`}
            data={responsiveData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              opacity={0.3}
            />

            {yesterdayArea && (
              <ReferenceArea
                x1={yesterdayArea.x1}
                x2={yesterdayArea.x2}
                fill="#e5e7eb"
                opacity={0.3}
                stroke="none"
              />
            )}

            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={width < 640 ? 60 : width < 1024 ? 40 : 20}
              tickFormatter={(value) => {
                const date = new Date(value);

                if (timeRange === "1h") {
                  return date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                } else if (timeRange === "3h") {
                  return date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                } else if (timeRange === "6h") {
                  return date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                } else if (timeRange === "12h") {
                  return date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    hour12: true,
                  });
                } else {
                  return date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    hour12: true,
                  });
                }
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[
                0,
                (() => {
                  const maxValue = Math.max(
                    ...responsiveData.map((item) => {
                      if (
                        item.totalActivity &&
                        typeof item.totalActivity === "number"
                      ) {
                        return item.totalActivity;
                      }
                      return Object.keys(item)
                        .filter(
                          (key) =>
                            key !== "timestamp" && key !== "totalActivity",
                        )
                        .reduce(
                          (sum, key) => sum + ((item[key] as number) || 0),
                          0,
                        );
                    }),
                  );

                  if (maxValue === 0) return 5;
                  if (maxValue <= 5) return 5;
                  if (maxValue <= 10) return 10;
                  if (maxValue <= 15) return 15;
                  if (maxValue <= 20) return 20;
                  if (maxValue <= 25) return 25;
                  if (maxValue <= 30) return 30;
                  if (maxValue <= 35) return 35;
                  if (maxValue <= 40) return 40;
                  if (maxValue <= 45) return 45;
                  if (maxValue <= 50) return 50;
                  if (maxValue <= 60) return 60;

                  return Math.ceil(maxValue / 15) * 15;
                })(),
              ]}
              ticks={(() => {
                const maxValue = Math.max(
                  ...responsiveData.map((item) => {
                    if (
                      item.totalActivity &&
                      typeof item.totalActivity === "number"
                    ) {
                      return item.totalActivity;
                    }
                    return Object.keys(item)
                      .filter(
                        (key) => key !== "timestamp" && key !== "totalActivity",
                      )
                      .reduce(
                        (sum, key) => sum + ((item[key] as number) || 0),
                        0,
                      );
                  }),
                );

                let domainMax: number;
                if (maxValue === 0) domainMax = 5;
                else if (maxValue <= 5) domainMax = 5;
                else if (maxValue <= 10) domainMax = 10;
                else if (maxValue <= 15) domainMax = 15;
                else if (maxValue <= 20) domainMax = 20;
                else if (maxValue <= 25) domainMax = 25;
                else if (maxValue <= 30) domainMax = 30;
                else if (maxValue <= 35) domainMax = 35;
                else if (maxValue <= 40) domainMax = 40;
                else if (maxValue <= 45) domainMax = 45;
                else if (maxValue <= 50) domainMax = 50;
                else if (maxValue <= 60) domainMax = 60;
                else domainMax = Math.ceil(maxValue / 15) * 15;

                const ticks = [0];
                if (domainMax <= 15) {
                  for (let i = 5; i <= domainMax; i += 5) {
                    ticks.push(i);
                  }
                } else if (domainMax <= 60) {
                  for (let i = 10; i <= domainMax; i += 10) {
                    ticks.push(i);
                  }
                } else {
                  for (let i = 15; i <= domainMax; i += 15) {
                    ticks.push(i);
                  }
                }

                return ticks;
              })()}
              tickFormatter={(value) => `${Math.round(value)}m`}
            />
            <ChartTooltip
              content={
                <CustomTooltip
                  chartConfig={enhancedChartConfig}
                  timeRange={timeRange}
                  totalDataPoints={responsiveData.length}
                />
              }
            />

            {projectKeys.map((projectKey, index) => (
              <Bar
                key={`bar-${projectKey}`}
                dataKey={projectKey}
                stackId="coding"
                fill={enhancedChartConfig[projectKey].color}
                fillOpacity={0.75}
                stroke={enhancedChartConfig[projectKey].color}
                strokeWidth={0}
                radius={
                  index === projectKeys.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]
                }
              />
            ))}

            <Line
              type="monotone"
              dataKey="totalActivity"
              stroke={enhancedChartConfig.totalActivity.color}
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />

            <ChartLegend
              content={
                <CustomLegendContent
                  chartConfig={enhancedChartConfig}
                  responsiveData={responsiveData}
                />
              }
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function DashboardStats({
  chartData,
  chartConfig,
}: DashboardStatsProps) {
  const [timeRange, setTimeRange] = useState("24h");

  const filteredData = useMemo(() => {
    return chartData.filter((item) => {
      const timestamp = new Date(item.timestamp);
      const now = new Date();
      let minutesToSubtract = 1440;

      if (timeRange === "12h") {
        minutesToSubtract = 720;
      } else if (timeRange === "6h") {
        minutesToSubtract = 360;
      } else if (timeRange === "3h") {
        minutesToSubtract = 180;
      } else if (timeRange === "1h") {
        minutesToSubtract = 60;
      }

      const startTime = new Date(now.getTime() - minutesToSubtract * 60 * 1000);
      return timestamp >= startTime;
    });
  }, [chartData, timeRange]);

  return (
    <ChartAreaInteractive
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      filteredData={filteredData}
      chartConfig={chartConfig}
    />
  );
}
