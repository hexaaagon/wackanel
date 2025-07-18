"use client";
import { useDashboardData, useAuthData } from "@/lib/app/store/hooks";
import DashboardContent from "./dashboard-content";
import DashboardSkeleton from "./dashboard-skeleton";

export default function DashboardPage() {
  const { stats, isLoading, error } = useDashboardData();
  const { isAuthenticated, isLoading: authLoading } = useAuthData();

  if (isLoading) {
    return (
      <main className="bg-secondary-background relative flex min-h-[100lvh] flex-col gap-2 overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] px-4 pt-20 md:px-8">
        <DashboardSkeleton />
      </main>
    );
  }

  if (!authLoading && !isAuthenticated) {
    return (
      <main className="flex min-h-[100lvh] items-center justify-center">
        <div className="text-2xl">You are not authenticated.</div>
      </main>
    );
  }

  if (error) {
    if (error === "user-not-found") {
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

  // Handle case where no stats available yet (shouldn't happen but just in case)
  if (!stats) {
    return (
      <main className="bg-secondary-background relative flex min-h-[100lvh] flex-col gap-2 overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] px-4 pt-20 md:px-8">
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main className="bg-secondary-background relative flex min-h-[100lvh] flex-col gap-2 overflow-hidden bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px] px-4 pt-20 md:px-8">
      <DashboardContent
        chartData={stats.chartData}
        chartConfig={stats.chartConfig}
        totalActivity={stats.totalActivity}
        newUser={stats.newUser}
      />
    </main>
  );
}
