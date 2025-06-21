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
} from "@/lib/chart/dashboard";

import ActivityStats from "./stats-activity";
import MainStats from "./stats-main";

async function getStatsData() {
  // TODO: Replace with actual API call when backend is ready
  // For now, generate sample data server-side
  const rawData = generateSampleData();
  const { chartData, chartConfig } = processData(rawData);

  return {
    chartData,
    chartConfig,
    generatedAt: new Date().toISOString(),
  };
}

export default async function DashboardPage() {
  // Fetch data server-side
  const statsData = await getStatsData();
  const { chartData, chartConfig } = statsData;

  // Calculate total activity for the last 24 hours (server-side)
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const filteredData = chartData.filter((item) => {
    const timestamp = new Date(item.timestamp);
    return timestamp >= last24Hours;
  });

  const totalActivity = filteredData.reduce((acc, item) => {
    return (
      acc +
      Object.keys(chartConfig).reduce((projectAcc, key) => {
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
      <header>
        <div className="text-2xl">
          <b suppressHydrationWarning>
            {hours > 0 ? `${hours} hrs ${minutes} mins` : `${minutes} mins`}
          </b>{" "}
          has counted over the last{" "}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <u>24 hours</u>.
              </TooltipTrigger>
              <TooltipContent className="bg-white" side="bottom">
                <p>
                  Active coding time tracked per minute. Shows actual time spent
                  writing code, not idle time. - SAMPLE DATA!
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>
      <section className="flex flex-col gap-4">
        <MainStats totalActivity={roundedTotalActivity} newUser={false} />
        <ActivityStats chartData={chartData} chartConfig={chartConfig} />
      </section>
    </main>
  );
}
