"use server";
import {
  ProcessedChartData,
  ChartConfig,
} from "@/lib/app/site/chart/dashboard";

import { getAuth } from "@/lib/auth/server";
import { supabaseService } from "@/lib/database/supabase/service-server";

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

  const { data: profile, error } = await supabaseService
    .from("user_wakatime_profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  if (!profile) {
    return "user-not-found";
  }

  const setupStatus = await getSetupStatus();

  if (typeof setupStatus === "string") {
    return {
      chartData: [],
      chartConfig: {},
      generatedAt: new Date().toISOString(),
      newUser: true,
    };
  }

  const rawData = generateSampleData();

  const { chartData, chartConfig } = processData(rawData);

  return {
    chartData,
    chartConfig,
    generatedAt: new Date().toISOString(),
    newUser: !setupStatus.isCompleted,
  };
}

import {
  generateSampleData,
  processData,
} from "@/lib/app/site/chart/dashboard";
import { getSetupStatus } from "../../actions/setup";
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
