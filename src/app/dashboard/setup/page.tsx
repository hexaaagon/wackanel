"use client";
import { Suspense, useState, useCallback, useEffect } from "react";
import { notFound, useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import Step1 from "./content/step-1";
import Step2 from "./content/step-2";
import Step3 from "./content/step-3";
import Step3M from "./content/step-3m";
import Step4 from "./content/step-4";
import Step5 from "./content/step-5";
import { completeSetup, restartSetup } from "@/lib/actions/setup";
import { toast } from "sonner";
import { store } from "@/lib/store";

export default function SetupPage() {
  return (
    <main className="flex min-h-[100lvh] items-center justify-center p-2 sm:p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <SetupContent />
      </Suspense>
    </main>
  );
}

function SetupContent() {
  const [isStep3Connected, setIsStep3Connected] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const [isReconnectMode, setIsReconnectMode] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleStep3Connection = useCallback((connected: boolean) => {
    setIsStep3Connected(connected);
  }, []);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const isManualSetup = searchParams.get("manual") === "true";
  const isSetupCompleted = searchParams.get("setup_completed") === "true";
  const isReconnect = searchParams.get("reconnect") === "true";

  useEffect(() => {
    if (isSetupCompleted && !isReconnect) {
      setShowCompletedDialog(true);
    } else if (isReconnect && currentPage !== 3) {
      router.push("/dashboard/setup?page=3&reconnect=true");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSetupCompleted, isReconnect, currentPage]);

  const handleCloseDialog = () => {
    setShowCompletedDialog(false);
    router.push("/dashboard");
  };

  const handleRestartSetup = async () => {
    try {
      const restartPromise = restartSetup();
      toast.promise(restartPromise, {
        loading: "Restarting setup...",
        success: "Setup restarted successfully!",
        error: "Failed to restart setup",
      });
      const result = await restartPromise;
      if (result === "error" || result === "unauthenticated") {
        throw new Error("Failed to restart setup");
      }
      setShowCompletedDialog(false);
      router.push("/dashboard/setup");
    } catch (error) {
      toast.error("Failed to restart setup");
    }
  };

  const handleReconnectWakatime = () => {
    setShowCompletedDialog(false);
    setIsReconnectMode(true);
    router.push("/dashboard/setup?page=3&reconnect=true");
  };

  const handleReconnectComplete = () => {
    router.push("/dashboard");
  };

  const steps = [
    { id: 1, title: "Getting Started", description: "Welcome to Wackanel" },
    { id: 2, title: "Install WakaTime", description: "Set up time tracking" },
    {
      id: 3,
      title: "Connect to Wackanel",
      description: "Link your WakaTime editor to Wackanel",
    },
    {
      id: 4,
      title: "Configure Instances",
      description: "Configure the instance you want to mirror.",
    },
    { id: 5, title: "Complete", description: "You're all set!" },
  ];

  const getCurrentStep = (page: number, manual: boolean): number | null => {
    if (isReconnectMode) {
      if (page === 3 || (manual && page === 3)) return 3;
      return 3; // Default to page 3 in reconnect mode
    }
    if (manual) return 3;
    if (page >= 1 && page <= 5) return page;
    return null;
  };

  const currentStep = getCurrentStep(currentPage, isManualSetup);
  const isStepCompleted = (stepId: number) =>
    currentStep !== null && stepId < currentStep;
  const isStepCurrent = (stepId: number) => currentStep === stepId;

  if (currentStep === null) return notFound();

  return (
    <div className="relative flex w-full flex-col bg-[linear-gradient(to_right,#80808033_1px,transparent_1px),linear-gradient(to_bottom,#80808033_1px,transparent_1px)] bg-[size:70px_70px]">
      {/* Setup Completed Dialog */}
      <Dialog
        open={showCompletedDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setup Already Completed</DialogTitle>
            <DialogDescription>
              Your setup is already complete. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="neutral" onClick={handleRestartSetup}>
              Restart Setup
            </Button>
            <Button onClick={handleReconnectWakatime}>
              Reconnect WakaTime
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Only show progress steps if not in reconnect mode */}
      {!isReconnectMode && (
        <div className="mt-20 mb-4 sm:mb-6 lg:mb-8">
          {/* Progress Steps */}
          <div className="mt-3 flex items-center justify-center overflow-x-auto px-2 sm:mt-4 sm:px-0 lg:mt-6">
            {/* Mobile compact view */}
            <div className="flex items-center space-x-2 xl:hidden">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center justify-center">
                    {isStepCompleted(step.id) ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : isStepCurrent(step.id) ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                        <span className="text-xs font-bold text-white">
                          {step.id}
                        </span>
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300">
                        <span className="text-xs font-bold text-gray-400">
                          {step.id}
                        </span>
                      </div>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mx-2">
                      <div
                        className={`h-0.5 w-4 ${
                          isStepCompleted(step.id)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tablet and desktop view */}
            <div className="hidden items-center space-x-4 xl:flex xl:space-x-6">
              {steps.map((step, index) => (
                <Link
                  key={step.id}
                  className="flex items-center"
                  href={`/dashboard/setup?page=${step.id}`}
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="flex items-center justify-center">
                      {isStepCompleted(step.id) ? (
                        <CheckCircle className="h-7 w-7 text-green-500 lg:h-8 lg:w-8" />
                      ) : isStepCurrent(step.id) ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 lg:h-8 lg:w-8">
                          <span className="text-sm font-bold text-white">
                            {step.id}
                          </span>
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-300 lg:h-8 lg:w-8">
                          <span className="text-sm font-bold text-gray-400">
                            {step.id}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <p
                        className={`max-w-20 truncate text-xs font-medium lg:max-w-24 ${
                          isStepCurrent(step.id)
                            ? "text-blue-500"
                            : isStepCompleted(step.id)
                              ? "text-green-500"
                              : "text-gray-400"
                        }`}
                        title={step.title}
                      >
                        {step.title}
                      </p>
                      <p
                        className="max-w-20 truncate text-xs leading-tight text-gray-500 lg:max-w-24"
                        title={step.description}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mx-3 lg:mx-4">
                      <div
                        className={`h-0.5 w-6 lg:w-8 ${
                          isStepCompleted(step.id)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile: Show current step info below */}
          <div className="mt-3 text-center xl:hidden">
            {currentStep && (
              <div className="px-4">
                <p className="text-xs font-medium text-blue-500">
                  {steps.find((s) => s.id === currentStep)?.title}
                </p>
                <p className="text-xs text-gray-500">
                  {steps.find((s) => s.id === currentStep)?.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="mx-auto w-full max-w-sm space-y-4 sm:max-w-2xl sm:space-y-6 lg:max-w-4xl">
        <Card className="bg-secondary-background mb-4 shadow-lg sm:mb-6 lg:mb-8">
          <CardHeader className="px-6 pb-2 sm:pb-3 lg:pb-4">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">
              {isReconnectMode
                ? "Reconnect WakaTime"
                : getPageTitle(currentPage, isManualSetup)}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm lg:text-base">
              {isReconnectMode
                ? "Reconnect your WakaTime account to Wackanel"
                : getPageDescription(currentPage, isManualSetup)}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pt-0 text-xs sm:text-sm lg:text-base">
            {getPageContent(
              currentPage,
              isManualSetup,
              handleStep3Connection,
              isReconnectMode,
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between px-3 sm:px-0">
          {isReconnectMode ? (
            <div className="flex w-full justify-center">
              <Button
                size="sm"
                className="text-xs sm:text-sm"
                onClick={handleReconnectComplete}
              >
                Completed
              </Button>
            </div>
          ) : (
            <>
              <div>
                {(currentPage > 1 || isManualSetup) && (
                  <Button
                    variant="neutral"
                    asChild
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    <Link
                      href={`/dashboard/setup?page=${isManualSetup ? 3 : currentPage - 1}`}
                    >
                      <ArrowLeft className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                      Previous
                    </Link>
                  </Button>
                )}
              </div>
              <div>
                {currentPage < steps.length && !isManualSetup ? (
                  currentPage === 3 ? (
                    <Button
                      asChild
                      size="sm"
                      className="text-xs sm:text-sm"
                      disabled={!isStep3Connected}
                    >
                      <Link
                        href={`/dashboard/setup?page=4`}
                        className={
                          !isStep3Connected
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      >
                        Next
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" className="text-xs sm:text-sm">
                      <Link href={`/dashboard/setup?page=${currentPage + 1}`}>
                        Next
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )
                ) : isManualSetup ? (
                  <Button asChild size="sm" className="text-xs sm:text-sm">
                    <Link href="/dashboard/setup?page=4">
                      <span className="hidden sm:inline">
                        Continue to Wakapi Setup
                      </span>
                      <span className="sm:hidden">Continue</span>
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="cursor-pointer text-xs sm:text-sm"
                    disabled={isCompleted}
                    onClick={async () => {
                      if (isCompleted) return;
                      const completePromise = completeSetup();
                      setIsCompleted(true);

                      completePromise
                        .then(async () => {
                          const actions = store.getActions();
                          actions.setup.setCompleted(true);
                          actions.dashboard.fetchStats();
                          window.location.href = "/dashboard";
                        })
                        .catch(() => {
                          setIsCompleted(false);
                        });

                      toast.promise(completePromise, {
                        loading: "Completing setup...",
                        success: "Setup completed successfully!",
                        error: (e) => `Failed to complete setup: ${e.message}`,
                      });
                    }}
                  >
                    <span className="hidden sm:inline">Complete Setup</span>
                    <span className="sm:hidden">Complete</span>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function getPageTitle(page: number, isManual: boolean = false): string {
  if (isManual) return "Manual Setup";

  switch (page) {
    case 1:
      return "Welcome to Wackanel";
    case 2:
      return "Install WakaTime";
    case 3:
      return "Connect Your Account";
    case 4:
      return "Setup Wakapi";
    case 5:
      return "Setup Complete";
    default:
      return "Setup";
  }
}

function getPageDescription(page: number, isManual: boolean = false): string {
  if (isManual) return "Configure WakaTime manually if needed";

  switch (page) {
    case 1:
      return "Let's get you started with your new Wackanel dashboard";
    case 2:
      return "Install WakaTime extension in your favorite editor";
    case 3:
      return "Automatically connect your WakaTime account";
    case 4:
      return "Set up additional Wakapi instances";
    case 5:
      return "You're all set! Your dashboard is ready to use";
    default:
      return "Setup your account";
  }
}

function getPageContent(
  page: number,
  isManual: boolean = false,
  onStep3Connection?: (connected: boolean) => void,
  isReconnectMode: boolean = false,
): React.ReactNode {
  if (isReconnectMode) {
    return isManual ? (
      <Step3M isReconnectMode={true} />
    ) : (
      <Step3 isReconnectMode={true} onConnectionChange={onStep3Connection} />
    );
  }

  if (isManual) return <Step3M />;

  switch (page) {
    case 1:
      return <Step1 />;
    case 2:
      return <Step2 />;
    case 3:
      return (
        <Step3 isReconnectMode={false} onConnectionChange={onStep3Connection} />
      );
    case 4:
      return <Step4 />;
    case 5:
      return <Step5 />;
    default:
      return <div className="text-2xl">Page not found.</div>;
  }
}
