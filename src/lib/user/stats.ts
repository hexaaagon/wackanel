"use server";
import { ProcessedChartData, ChartConfig } from "@/lib/misc/chart/dashboard";

import { getAuth } from "@/lib/auth/server";
import { createServiceServer } from "@/lib/db_supabase/service-server";

type ErrorResponse = "unauthenticated" | "user-not-found";

export async function getUserStats(
  auth: Awaited<ReturnType<typeof getAuth>>,
): Promise<
  | ErrorResponse
  | {
      chartData: ProcessedChartData[];
      chartConfig: ChartConfig;
      generatedAt: string;
      newUser: boolean;
    }
> {
  if (!auth?.user.id) {
    return "unauthenticated";
  }

  const supabase = createServiceServer();

  const { data: profile, error } = await supabase
    .from("user_wakatime_profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  if (!profile) {
    console.log("Profile not found:", error);
    return "user-not-found";
  }

  const { data: apikeyExists } = await supabase
    .from("apikey")
    .select("id")
    .eq("userId", auth.user.id)
    .single();

  if (!apikeyExists?.id)
    return {
      chartData: [],
      chartConfig: {},
      generatedAt: new Date().toISOString(),
      newUser: true,
    };

  const rawData = generateSampleData();
  const { chartData, chartConfig } = processData(rawData);

  return {
    chartData,
    chartConfig,
    generatedAt: new Date().toISOString(),
    newUser: false,
  };
}

import { generateSampleData, processData } from "@/lib/misc/chart/dashboard";
export async function generated_getUserStats(
  user: Awaited<ReturnType<typeof getAuth>>,
) {
  const rawData = generateSampleData();
  const { chartData, chartConfig } = processData(rawData);

  return {
    chartData,
    chartConfig,
    generatedAt: new Date().toISOString(),
    newUser: true,
  };
}
