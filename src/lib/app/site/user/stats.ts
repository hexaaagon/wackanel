"use server";
import {
  ProcessedChartData,
  ChartConfig,
} from "@/lib/app/site/chart/dashboard";

import { getAuth } from "@/lib/auth/server";
import { supabaseService } from "@/lib/database/supabase/service-server";
import { getHeartbeatChartData } from "@/lib/backend/services/heartbeat-charts";
import { getSetupStatus } from "../../actions/setup";
import {
  generateSampleData,
  processData,
} from "@/lib/app/site/chart/dashboard";

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

  // Get real heartbeat data for the last 24 hours
  try {
    const heartbeatData = await getHeartbeatChartData(auth.user.id, 24);
    
    return {
      chartData: heartbeatData.chartData,
      chartConfig: heartbeatData.chartConfig,
      generatedAt: heartbeatData.generatedAt,
      newUser: !setupStatus.isCompleted,
    };
  } catch (error) {
    console.error("Error fetching heartbeat data:", error);
    
    // Fallback to sample data if there's an error or no data
    const rawData = generateSampleData();
    const { chartData, chartConfig } = processData(rawData);
    
    return {
      chartData,
      chartConfig,
      generatedAt: new Date().toISOString(),
      newUser: !setupStatus.isCompleted,
    };
  }
}

export async function generated_getUserStats(
  user: Awaited<ReturnType<typeof getAuth>>,
) {
  const rawData = generateSampleData();

  const { chartData, chartConfig } = processData(rawData);

  return {
    chartData,
    chartConfig,
    generatedAt: new Date().toISOString(),
    newUser: false,
  };
}
