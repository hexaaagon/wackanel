import {
  Zap,
  Loader2,
  CheckCircle,
  Settings,
  RefreshCw,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, CodeBlock } from "@/components/app/setup";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { generateInstallerKey, hasSentHeartbeat } from "@/lib/actions/setup";
import { executeInstall } from "@/scripts/execute";

interface Step3Props {
  isReconnectMode: boolean;
  onConnectionChange?: (connected: boolean) => void;
}

export default function Step3({
  isReconnectMode = false,
  onConnectionChange,
}: Step3Props) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [installScript, setInstallScript] = useState<string | null>(null);
  const [allInstallScripts, setAllInstallScripts] = useState<{
    windows?: string;
    unix?: string;
  }>({});
  const [detectedOS, setDetectedOS] = useState<
    "windows" | "macos" | "linux" | null
  >(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryTimeout, setRetryTimeout] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("win")) {
      setDetectedOS("windows");
    } else if (userAgent.includes("mac")) {
      setDetectedOS("macos");
    } else {
      setDetectedOS("linux");
    }
  }, []);

  const checkHeartbeat = useCallback(async () => {
    try {
      const result = await hasSentHeartbeat();
      if (result.sent) {
        setIsConnected(true);
        onConnectionChange?.(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error checking heartbeat:", error);
    }
  }, [onConnectionChange]);

  useEffect(() => {
    if (detectedOS && !apiKey && !isConnecting) {
      const autoConnect = async () => {
        setIsConnecting(true);

        try {
          const key = await generateInstallerKey();
          setApiKey(key.apiKey);

          const scriptUrl = window.location.origin;
          const installCommands = await executeInstall(
            scriptUrl,
            key.installerToken,
          );
          setAllInstallScripts({
            windows: installCommands.powershell,
            unix: installCommands.shell,
          });
          setInstallScript(
            detectedOS === "windows"
              ? installCommands.powershell
              : installCommands.shell,
          );

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          intervalRef.current = setInterval(checkHeartbeat, 30000);
        } catch (error) {
          console.error("Error during connection:", error);
        } finally {
          setIsConnecting(false);
        }
      };

      autoConnect();
    }
  }, [detectedOS, apiKey, isConnecting, checkHeartbeat]);

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(checkHeartbeat, 30000);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryTimeout(10);

    const countdown = setInterval(() => {
      setRetryTimeout((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsRetrying(false);
          startPolling();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    await checkHeartbeat();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Zap className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          Connect Your Wakatime Editor
        </h3>
        <p className="mx-auto max-w-md text-gray-600">
          To start tunneling your activity, we need to connect your Wakatime
          editor with Wackanel. This step will guide you through the automatic
          setup process.
        </p>
      </div>

      <Alert variant="danger">
        <div>
          <strong>Notice!</strong>
          <p className="mt-2 text-sm">
            Don&apos;t set up Wackanel yet! The installation script will
            currently fail because the backend systems are not yet implemented.
            Please check back later or follow project updates for availability.
          </p>
        </div>
      </Alert>

      <div className="rounded-lg border bg-white p-6">
        <h4 className="mb-4 font-semibold">Automatic Setup</h4>

        {!apiKey ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
            <div>
              <h5 className="font-medium text-blue-800">
                Setting up your account...
              </h5>
              <p className="text-sm text-blue-600">
                We&apos;re generating your API key and preparing installation
                instructions.
              </p>
            </div>
          </div>
        ) : !isConnected ? (
          <div className="space-y-4">
            <Alert variant="info">
              <div>
                <strong>Run this command in your terminal:</strong>
                <p className="mt-1 text-sm">
                  Copy and paste the command below into your{" "}
                  {detectedOS === "windows" ? "PowerShell" : "terminal"} to
                  install Wackanel.
                </p>
              </div>
            </Alert>

            <div className="relative mb-2">
              <CodeBlock title="Command">{installScript || ""}</CodeBlock>
            </div>

            {/* Accordion for other OS (Windows, Linux or macOS) */}
            {apiKey && installScript && detectedOS && (
              <Accordion type="single" collapsible className="mb-2">
                {detectedOS !== "windows" && (
                  <AccordionItem value="windows">
                    <AccordionTrigger>Windows</AccordionTrigger>
                    <AccordionContent>
                      <CodeBlock title="Command">
                        {allInstallScripts.windows || ""}
                      </CodeBlock>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {detectedOS === "windows" && (
                  <AccordionItem value="unix">
                    <AccordionTrigger>
                      Linux, Mac, or Codespace
                    </AccordionTrigger>
                    <AccordionContent>
                      <CodeBlock title="Command">
                        {allInstallScripts.unix || ""}
                      </CodeBlock>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            )}

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                variant="neutral"
                className="cursor-pointer"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retry in {retryTimeout}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Check Again
                  </>
                )}
              </Button>
            </div>

            <Alert variant="warning">
              <div>
                <strong>Waiting for installation...</strong>
                <p className="mt-1 text-sm">
                  After running the command, we&apos;ll automatically detect
                  when Wackanel is installed and configured. This page will
                  update automatically every 30 seconds.
                </p>
              </div>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h5 className="font-medium text-green-800">
                Successfully Connected!
              </h5>
              <p className="text-sm text-green-600">
                Your WakaTime editor is now connected to Wackanel. You can
                proceed to the next step.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Need manual setup?</h4>
            <p className="text-sm text-gray-600">
              If automatic setup doesn&apos;t work, you can configure everything
              manually.
            </p>
          </div>
          <Button variant="neutral" asChild>
            <Link
              href={`/dashboard/setup?${isReconnectMode ? "completed_type=reconnect-wakatime&" : "page=3&"}manual=true`}
            >
              <Settings className="mr-2 h-4 w-4" />
              Manual Setup
            </Link>
          </Button>
        </div>
      </div>

      <Alert variant="info">
        <div>
          <strong>What happens during setup?</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• We generate a unique API key for your account</li>
            <li>• Configure your WakaTime integration</li>
            <li>• Test the connection to ensure everything works</li>
          </ul>
        </div>
      </Alert>
    </div>
  );
}
