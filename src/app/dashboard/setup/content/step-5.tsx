"use client";
import {
  CheckCircle,
  BarChart3,
  Settings,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/app/store";
import { completeSetup } from "@/lib/app/actions/setup";
import { toast } from "sonner";

export default function Step6(state: {
  isCompleted: boolean;
  setIsCompleted?: (completed: boolean) => void;
}) {
  const handleDashboardNavigation = async () => {
    if (state.isCompleted) return toast.error("Setup already completed");

    const completePromise = completeSetup();
    state.setIsCompleted?.(true);

    toast.promise(completePromise, {
      loading: "Completing setup...",
      success: "Setup completed successfully!",
      error: (e) => `Failed to complete setup: ${e.message}`,
    });

    try {
      const result = await completePromise;
      if (result === "error" || result === "unauthenticated") {
        throw new Error("Failed to complete setup");
      }

      const actions = store.getActions();
      actions.dashboard.fetchStats();
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Failed to complete setup");
    }
  };

  const handleSettingsNavigation = async () => {
    if (state.isCompleted) return toast.error("Setup already completed");

    const completePromise = completeSetup();
    state.setIsCompleted?.(true);

    toast.promise(completePromise, {
      loading: "Completing setup...",
      success: "Setup completed successfully!",
      error: (e) => `Failed to complete setup: ${e.message}`,
    });

    try {
      const result = await completePromise;
      if (result === "error" || result === "unauthenticated") {
        throw new Error("Failed to complete setup");
      }

      const actions = store.getActions();
      actions.dashboard.fetchStats();
      window.location.href = "/dashboard/settings";
    } catch (error) {
      toast.error("Failed to complete setup");
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">Setup Complete! 🎉</h3>
        <p className="mx-auto max-w-md text-gray-600">
          Your Wackanel dashboard is ready to use. You can now start tracking
          your coding activity and explore your development insights.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6 transition-all duration-200 hover:border-blue-300 hover:shadow-lg">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="mb-2 font-semibold">📊 View Your Stats</h4>
          <p className="text-sm text-gray-600">
            Check out your coding statistics, time tracking, and activity
            patterns across different projects and languages.
          </p>
          <Button
            variant="neutral"
            size="sm"
            className="mt-3"
            onClick={handleDashboardNavigation}
            disabled={state.isCompleted}
          >
            View Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-lg border p-6 transition-all duration-200 hover:border-purple-300 hover:shadow-lg">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Settings className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="mb-2 font-semibold">⚙️ Customize Settings</h4>
          <p className="text-sm text-gray-600">
            Fine-tune your dashboard preferences, manage integrations, and
            configure notifications to match your workflow.
          </p>
          <Button
            variant="neutral"
            size="sm"
            className="mt-3"
            onClick={handleSettingsNavigation}
            disabled={state.isCompleted}
          >
            Open Settings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-gray-50 p-4">
          <h5 className="mb-1 text-sm font-medium">Daily Tracking</h5>
          <p className="text-xs text-gray-600">
            Monitor your daily coding habits and productivity
          </p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-4">
          <h5 className="mb-1 text-sm font-medium">Project Insights</h5>
          <p className="text-xs text-gray-600">
            Analyze time spent across different projects
          </p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-4">
          <h5 className="mb-1 text-sm font-medium">Language Stats</h5>
          <p className="text-xs text-gray-600">
            See your programming language usage patterns
          </p>
        </div>
      </div>

      <div className="rounded-lg border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-blue-50 p-6">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-green-600" />
          <h4 className="font-semibold text-green-900">Pro Tips</h4>
        </div>
        <div className="space-y-1 text-sm text-green-800">
          <p>• Keep your editors open while coding for accurate tracking</p>
          <p>• Check your dashboard daily to monitor your progress</p>
          <p>• Set coding goals to stay motivated and productive</p>
          <p>• You can always return to setup from dashboard settings</p>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-xs text-gray-500">
          Need help getting started? Check out our{" "}
          <a href="/docs" className="text-blue-600 hover:underline">
            documentation
          </a>{" "}
          or{" "}
          <a href="/support" className="text-blue-600 hover:underline">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}
