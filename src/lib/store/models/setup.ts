import { action, thunk } from "easy-peasy";
import {
  completeSetup as completeSetupAction,
  restartSetup as restartSetupAction,
} from "@/lib/actions/setup";
import type { SetupModel } from "../types";

export const setupModel: SetupModel = {
  isCompleted: false,
  currentStep: 1,
  steps: {
    1: { completed: false },
    2: { completed: false },
    3: { completed: false },
    4: { completed: false },
    5: { completed: false },
  },
  isLoading: false,

  // Actions
  setCompleted: action((state, payload) => {
    state.isCompleted = payload;
  }),

  setCurrentStep: action((state, payload) => {
    state.currentStep = payload;
  }),

  updateStepStatus: action((state, payload) => {
    state.steps[payload.step] = {
      completed: payload.completed,
      data: payload.data,
    };
  }),

  setLoading: action((state, payload) => {
    state.isLoading = payload;
  }),

  // Thunks
  completeSetup: thunk(async (actions) => {
    try {
      actions.setLoading(true);
      await completeSetupAction();
      actions.setCompleted(true);

      for (let i = 1; i <= 5; i++) {
        actions.updateStepStatus({ step: i, completed: true });
      }
    } catch (error) {
      console.error("Error completing setup:", error);
      throw error;
    } finally {
      actions.setLoading(false);
    }
  }),

  restartSetup: thunk(async (actions) => {
    try {
      actions.setLoading(true);
      await restartSetupAction();
      actions.setCompleted(false);
      actions.setCurrentStep(1);

      for (let i = 1; i <= 5; i++) {
        actions.updateStepStatus({ step: i, completed: false });
      }
    } catch (error) {
      console.error("Error restarting setup:", error);
      throw error;
    } finally {
      actions.setLoading(false);
    }
  }),
};
