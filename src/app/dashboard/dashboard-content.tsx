"use client";
import { Suspense } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/lib/store/hooks";
import ActivityStats from "./stats-activity";
import MainStats from "./stats-main";
import {
  type ProcessedChartData,
  type ChartConfig as DashboardChartConfig,
} from "@/lib/misc/chart/dashboard";

interface DashboardContentProps {
  chartData: ProcessedChartData[];
  chartConfig: DashboardChartConfig;
  totalActivity: number;
  newUser: boolean;
}

export default function DashboardContent({
  chartData,
  chartConfig,
  totalActivity,
  newUser,
}: DashboardContentProps) {
  return (
    <section className="flex flex-col gap-4">
      <MainStats totalActivity={totalActivity} newUser={newUser} />
      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="bg-card border-border h-[400px] w-full rounded-lg border p-6">
              <div className="mb-4 h-6 w-32 rounded bg-gray-300"></div>
              <div className="mb-2 h-4 w-48 rounded bg-gray-300"></div>
              <div className="h-[300px] w-full rounded bg-gray-200"></div>
            </div>
          </div>
        }
      >
        <ActivityStats chartData={chartData} chartConfig={chartConfig} />
      </Suspense>
    </section>
  );
}
