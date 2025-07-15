import { Action, Computed, Thunk } from "easy-peasy";
import type { Session, User } from "better-auth/types";
import type {
  ProcessedChartData,
  ChartConfig,
} from "@/lib/misc/chart/dashboard";

// Auth Model Types
export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastRefresh: number;
}

export interface AuthModel extends AuthState {
  // Actions
  setAuth: Action<AuthModel, { user: User; session: Session }>;
  clearAuth: Action<AuthModel>;
  setLoading: Action<AuthModel, boolean>;
  updateLastRefresh: Action<AuthModel>;

  // Thunks
  refreshAuth: Thunk<AuthModel>;
  initializeAuth: Thunk<AuthModel>;
}

// Dashboard Model Types
export interface DashboardStats {
  chartData: ProcessedChartData[];
  chartConfig: ChartConfig;
  generatedAt: string;
  newUser: boolean;
  totalActivity: number;
}

export interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number;
}

export interface DashboardModel extends DashboardState {
  // Actions
  setStats: Action<DashboardModel, DashboardStats>;
  setLoading: Action<DashboardModel, boolean>;
  setError: Action<DashboardModel, string | null>;
  updateLastFetch: Action<DashboardModel>;

  // Thunks
  fetchStats: Thunk<DashboardModel, void, unknown, StoreModel>;
  refreshStats: Thunk<DashboardModel, void, unknown, StoreModel>;
}

// Setup Model Types
export interface SetupState {
  isCompleted: boolean;
  currentStep: number;
  steps: {
    [key: number]: {
      completed: boolean;
      data?: unknown;
    };
  };
  isLoading: boolean;
}

export interface SetupModel extends SetupState {
  // Actions
  setCompleted: Action<SetupModel, boolean>;
  setCurrentStep: Action<SetupModel, number>;
  updateStepStatus: Action<
    SetupModel,
    { step: number; completed: boolean; data?: unknown }
  >;
  setLoading: Action<SetupModel, boolean>;

  // Thunks
  completeSetup: Thunk<SetupModel>;
  restartSetup: Thunk<SetupModel>;
}

// Root Store Model
export interface StoreModel {
  auth: AuthModel;
  dashboard: DashboardModel;
  setup: SetupModel;
}
