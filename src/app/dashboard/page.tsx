"use client";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  generateSampleData,
  processData,
  calculateTotalTime,
  type ProcessedChartData,
  type ChartConfig,
} from "@/lib/misc/chart/dashboard";

import { getUserStats } from "@/lib/user/stats";
import { authClient } from "@/lib/auth/client";

import DashboardContent from "./dashboard-content";
import DashboardSkeleton from "./dashboard-skeleton";

type StatsData = {
  chartData: ProcessedChartData[];
  chartConfig: ChartConfig;
  generatedAt: string;
  newUser: boolean;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const session = await authClient.getSession();

        // Transform the client session to match the expected auth format
        if (!session.data?.user?.id) {
          setError("unauthenticated");
          return;
        }

        const authData = {
          user: session.data.user,
          session: session.data.session,
        };

        const userStats = await getUserStats(authData);

        if (typeof userStats === "string") {
          setError(userStats);
        } else {
          setStats(userStats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="bg-secondary-background relative flex min-h-[100lvh] flex-col gap-2 overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] px-4 pt-20 md:px-8">
        <DashboardSkeleton />
      </main>
    );
  }

  if (error || !stats) {
    if (error === "unauthenticated") {
      return (
        <main className="flex min-h-[100lvh] items-center justify-center">
          <div className="text-2xl">You are not authenticated.</div>
        </main>
      );
    } else if (error === "user-not-found") {
      return (
        <main className="flex min-h-[100lvh] items-center justify-center">
          <div className="text-2xl">User not found.</div>
        </main>
      );
    } else {
      return (
        <main className="flex min-h-[100lvh] items-center justify-center">
          <div className="text-2xl">Error: {error}</div>
        </main>
      );
    }
  }

  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const filteredData = stats.chartData.filter((item) => {
    const timestamp = new Date(item.timestamp);
    return timestamp >= last24Hours;
  });

  const totalActivity = filteredData.reduce((acc, item) => {
    return (
      acc +
      Object.keys(stats.chartConfig).reduce((projectAcc, key) => {
        if (key !== "timestamp") {
          return projectAcc + ((item[key] as number) || 0);
        }
        return projectAcc;
      }, 0)
    );
  }, 0);

  const roundedTotalActivity = Math.round(totalActivity);

  return (
    <main className="bg-secondary-background relative flex min-h-[100lvh] flex-col gap-2 overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] px-4 pt-20 md:px-8">
      <DashboardContent
        chartData={stats.chartData}
        chartConfig={stats.chartConfig}
        totalActivity={roundedTotalActivity}
        newUser={stats.newUser}
      />
    </main>
  );
}
