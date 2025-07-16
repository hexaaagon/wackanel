import { useState, useEffect } from "react";
import Link from "next/link";

import { Zap, Key, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, CodeBlock } from "@/lib/setup-docs-components";

import { getApiKey } from "@/lib/actions/setup";
import { generateScript } from "@/scripts/execute";
import { Skeleton } from "@/components/ui/skeleton";

export default function Step3M({ isReconnectMode = false }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [installScript, setInstallScript] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getApiKey();
        setApiKey(key);
        setInstallScript(await generateScript("config", key));
      } catch (error) {
        console.error("Error fetching API key:", error);
      }
    };

    fetchApiKey();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
          <Key className="h-8 w-8 text-yellow-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Manual Setup</h3>
        <p className="mx-auto max-w-md text-gray-600">
          Configure your WakaTime integration manually by providing your API key
          and settings.
        </p>
      </div>

      <Alert variant="danger">
        <div>
          <strong>Notice!</strong>
          <p className="mt-2 text-sm">
            Don&apos;t set up Wackanel yet! The provided API key is invalid and
            will not track activity in either Wackanel or WakaTime. Please check
            back later or follow project updates for availability.
          </p>
        </div>
      </Alert>

      <Alert variant="warning">
        <div>
          <strong>You&apos;re on the Advanced Setup!</strong>
          <p className="mt-2 text-sm">
            This is for advanced users who want to manually configure their
            setup or have specific requirements.
          </p>
          <div className="mt-3 flex justify-start">
            <Button
              variant="neutral"
              size="sm"
              className="border-yellow-700 bg-yellow-50 text-xs text-yellow-700 hover:underline"
              asChild
            >
              <Link
                href={`/dashboard/setup?${isReconnectMode ? "completed_type=reconnect-wakatime" : "page=3"}`}
              >
                <Zap className="ml-1 inline h-4 w-4" />
                Automatic Setup
              </Link>
            </Button>
          </div>
        </div>
      </Alert>

      <div className="rounded-lg border bg-white p-6">
        <h4 className="flex items-center gap-2 font-semibold">
          Configure WakaTime
        </h4>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Create or edit your WakaTime configuration file:
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-gray-100 p-3 px-5">
              <h5 className="mb-2 text-sm font-medium">Windows</h5>
              <CodeBlock title="Wakatime config path">
                %USERPROFILE%\.wakatime.cfg
              </CodeBlock>
            </div>

            <div className="rounded-lg bg-gray-100 p-3 px-5">
              <h5 className="mb-2 text-sm font-medium">Linux or macOS</h5>
              <CodeBlock title="Wakatime config path">
                ~/.wakatime.cfg
              </CodeBlock>
            </div>
          </div>

          <div className="rounded-lg bg-gray-100 p-4 px-6">
            <p className="mb-3 text-sm font-medium text-gray-700">
              Configuration content:
            </p>
            {apiKey && installScript ? (
              <>
                <CodeBlock title=".wakatime.cfg">{installScript}</CodeBlock>
              </>
            ) : (
              <>
                <Skeleton className="h-[113px] w-full md:h-[129.22px]" />
              </>
            )}
          </div>
        </div>
      </div>

      <Alert variant="info">
        <div>
          <strong>Need help?</strong>
          <p className="mt-1 text-sm">
            Check out the{" "}
            <a
              href="https://wakatime.com/help"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WakaTime documentation
            </a>{" "}
            for detailed setup instructions for your specific editor.
          </p>
        </div>
      </Alert>
    </div>
  );
}
