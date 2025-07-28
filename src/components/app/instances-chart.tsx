"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface InstanceData {
  status: string;
  count: number;
  fill: string;
}

interface InstancesChartProps {
  onlineCount: number;
  offlineCount: number;
}

const chartConfig = {
  count: {
    label: "Instances",
  },
  online: {
    label: "Online",
    color: "hsl(var(--chart-2))", // Green
  },
  offline: {
    label: "Offline",
    color: "hsl(var(--chart-1))", // Red
  },
  none: {
    label: "None",
    color: "hsl(var(--muted-foreground) / 0.3)", // Light gray
  },
} satisfies ChartConfig;

export default function InstancesChart({
  onlineCount,
  offlineCount,
}: InstancesChartProps) {
  const totalInstances = onlineCount + offlineCount;

  const chartData: InstanceData[] = React.useMemo(() => {
    const data: InstanceData[] = [];

    if (totalInstances === 0) {
      // Show light gray circle when no instances
      data.push({
        status: "none",
        count: 1,
        fill: "hsl(var(--muted-foreground) / 0.3)",
      });
    } else {
      if (onlineCount > 0) {
        data.push({
          status: "online",
          count: onlineCount,
          fill: "hsl(var(--chart-2))",
        });
      }

      if (offlineCount > 0) {
        data.push({
          status: "offline",
          count: offlineCount,
          fill: "hsl(var(--chart-1))",
        });
      }
    }

    return data;
  }, [onlineCount, offlineCount, totalInstances]);

  const getStatusText = () => {
    if (totalInstances === 0) return "No instances";
    if (offlineCount === 0) return "All online";
    if (onlineCount === 0) return "All offline";
    return `${onlineCount} online, ${offlineCount} offline`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Instances</CardTitle>
        <CardDescription>
          Overview of instance status and activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ChartContainer
            config={chartConfig}
            className="h-16 w-16 flex-shrink-0"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={24}
                outerRadius={30}
                strokeWidth={0}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-lg font-bold"
                          >
                            {totalInstances}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="flex-1">
            <div className="text-foreground mb-1 text-sm font-medium">
              {getStatusText()}
            </div>
            {totalInstances > 0 && (
              <div className="flex gap-3 text-xs">
                {onlineCount > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="bg-chart-2 h-2 w-2 rounded-full"></div>
                    <span className="text-muted-foreground">
                      {onlineCount} online
                    </span>
                  </div>
                )}
                {offlineCount > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="bg-chart-1 h-2 w-2 rounded-full"></div>
                    <span className="text-muted-foreground">
                      {offlineCount} offline
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
