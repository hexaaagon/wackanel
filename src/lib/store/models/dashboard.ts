import { action, computed, thunk } from "easy-peasy";
import { getUserStats } from "@/lib/user/stats";
import type { DashboardModel, DashboardStats } from "../types";

export const dashboardModel: DashboardModel = {
  stats: null,
  isLoading: true,
  error: null,
  lastFetch: 0,

  setStats: action((state, payload) => {
    state.stats = payload;
    state.error = null;
    state.isLoading = false;
    state.lastFetch = Date.now();
  }),

  setLoading: action((state, payload) => {
    state.isLoading = payload;
  }),

  setError: action((state, payload) => {
    state.error = payload;
    state.isLoading = false;
  }),

  updateLastFetch: action((state) => {
    state.lastFetch = Date.now();
  }),

  fetchStats: thunk(async (actions, _payload, { getState, getStoreState }) => {
    const state = getState();
    const storeState = getStoreState();

    if (state.stats) {
      actions.setLoading(false);
      return;
    }

    if (
      !storeState.auth.isAuthenticated ||
      !storeState.auth.user ||
      !storeState.auth.session
    ) {
      actions.setLoading(false);
      actions.setError("unauthenticated");
      return;
    }

    try {
      actions.setLoading(true);
      actions.setError(null);

      const authData = {
        user: storeState.auth.user,
        session: storeState.auth.session,
      };

      const result = await getUserStats(authData);

      if (typeof result === "string") {
        actions.setError(result);
        return;
      }

      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const filteredData = result.chartData.filter((item) => {
        const timestamp = new Date(item.timestamp);
        return timestamp >= last24Hours;
      });

      const totalActivity = filteredData.reduce((acc, item) => {
        return (
          acc +
          Object.keys(result.chartConfig).reduce((projectAcc, key) => {
            if (key !== "timestamp") {
              return projectAcc + ((item[key] as number) || 0);
            }
            return projectAcc;
          }, 0)
        );
      }, 0);

      const statsWithTotal: DashboardStats = {
        ...result,
        totalActivity: Math.round(totalActivity),
      };

      actions.setStats(statsWithTotal);
    } catch (error) {
      console.error("Error fetching stats:", error);
      actions.setError("Failed to fetch data");
    }
  }),

  refreshStats: thunk(async (actions, _payload, { getState }) => {
    actions.setStats({
      chartData: [],
      chartConfig: {},
      generatedAt: new Date().toISOString(),
      newUser: false,
      totalActivity: 0,
    });
    actions.updateLastFetch();

    await actions.fetchStats();
  }),
};
