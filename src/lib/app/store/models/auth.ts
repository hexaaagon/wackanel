import { action, thunk } from "easy-peasy";
import { authClient } from "@/lib/auth/client";
import type { AuthModel } from "../types";

export const authModel: AuthModel = {
  // Initial state
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  lastRefresh: 0,

  // Actions
  setAuth: action((state, payload) => {
    state.user = payload.user;
    state.session = payload.session;
    state.isAuthenticated = true;
    state.isLoading = false;
    state.lastRefresh = Date.now();
  }),

  clearAuth: action((state) => {
    state.user = null;
    state.session = null;
    state.isAuthenticated = false;
    state.isLoading = false;
    state.lastRefresh = 0;
  }),

  setLoading: action((state, payload) => {
    state.isLoading = payload;
  }),

  updateLastRefresh: action((state) => {
    state.lastRefresh = Date.now();
  }),

  // Thunks
  refreshAuth: thunk(async (actions) => {
    try {
      actions.setLoading(true);
      const session = await authClient.getSession();

      if (session.data?.user && session.data?.session) {
        actions.setAuth({
          user: session.data.user,
          session: session.data.session,
        });
      } else {
        actions.clearAuth();
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      actions.clearAuth();
    } finally {
      actions.setLoading(false);
    }
  }),

  initializeAuth: thunk(async (actions, _payload, { getState }) => {
    const state = getState();
    const now = Date.now();
    const timeSinceLastRefresh = now - state.lastRefresh;

    if (state.isAuthenticated && timeSinceLastRefresh < 5 * 60 * 1000) {
      return;
    }

    await actions.refreshAuth();
  }),
};
