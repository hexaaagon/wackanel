import { createStore, persist, createTypedHooks } from "easy-peasy";
import { authModel } from "./models/auth";
import { dashboardModel } from "./models/dashboard";
import { setupModel } from "./models/setup";
import type { StoreModel } from "./types";

export const store = createStore<StoreModel>({
  auth: authModel,
  dashboard: dashboardModel,
  setup: setupModel,
});

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
export const useStore = typedHooks.useStore;
