import { useEffect } from "react";
import { useStoreState, useStoreActions } from ".";

export function useDashboardData() {
  const dashboardState = useStoreState((state) => state.dashboard);
  const authState = useStoreState((state) => state.auth);
  const dashboardActions = useStoreActions((actions) => actions.dashboard);

  useEffect(() => {
    if (authState.isAuthenticated && !authState.isLoading) {
      dashboardActions.fetchStats();
    } else if (!authState.isAuthenticated && !authState.isLoading) {
      dashboardActions.setLoading(false);
    }
  }, [authState.isAuthenticated, authState.isLoading, dashboardActions]);

  const isLoading =
    authState.isLoading ||
    (authState.isAuthenticated && dashboardState.isLoading);

  const error =
    !authState.isLoading && authState.isAuthenticated
      ? dashboardState.error
      : null;

  return {
    stats: dashboardState.stats,
    isLoading,
    error,
    refreshStats: dashboardActions.refreshStats,
    fetchStats: dashboardActions.fetchStats,
  };
}

export function useAuthData() {
  const authState = useStoreState((state) => state.auth);
  const authActions = useStoreActions((actions) => actions.auth);

  return {
    user: authState.user,
    session: authState.session,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    refreshAuth: authActions.refreshAuth,
    clearAuth: authActions.clearAuth,
  };
}
