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
} from "@/lib/misc/chart/dashboard";

import { getUserStats } from "@/lib/user/stats";
import { getAuth } from "@/lib/auth/server";

import ActivityStats from "./stats-activity";
import MainStats from "./stats-main";

export default async function DashboardPage() {
  const auth = await getAuth();
  const stats = await getUserStats(auth);

  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  if (typeof stats === "string") {
    if (stats === "unauthenticated") {
      return (
        <main className="flex min-h-[100lvh] items-center justify-center">
          <div className="text-2xl">You are not authenticated.</div>
        </main>
      );
    } else if (stats === "user-not-found") {
      return (
        <main className="flex min-h-[100lvh] items-center justify-center">
          <div className="text-2xl">User not found.</div>
        </main>
      );
    }
  }

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
  const hours = Math.floor(roundedTotalActivity / 60);
  const minutes = roundedTotalActivity % 60;

  return (
    <main className="bg-secondary-background relative flex min-h-[100lvh] flex-col gap-2 overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] px-4 pt-20 md:px-8">
      <section className="flex flex-col gap-4">
        <MainStats
          totalActivity={roundedTotalActivity}
          newUser={stats.newUser}
        />
        <ActivityStats
          chartData={stats.chartData}
          chartConfig={stats.chartConfig}
        />
      </section>
    </main>
  );
}
