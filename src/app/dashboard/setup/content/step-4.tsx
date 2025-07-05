import { Server, Plus, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, CodeBlock } from "@/lib/setup-docs-components";
import { useState } from "react";

interface WakapiInstance {
  id: string;
  name: string;
  url: string;
  status: "connected" | "connecting" | "error";
}

export default function Step5() {
  const [instances, setInstances] = useState<WakapiInstance[]>([
    {
      id: "1",
      name: "Personal Wakapi",
      url: "https://wakapi.dev",
      status: "connected",
    },
  ]);
  const [newInstanceUrl, setNewInstanceUrl] = useState("");

  const addInstance = () => {
    if (newInstanceUrl) {
      const newInstance: WakapiInstance = {
        id: Date.now().toString(),
        name: `Instance ${instances.length + 1}`,
        url: newInstanceUrl,
        status: "connecting",
      };
      setInstances([...instances, newInstance]);
      setNewInstanceUrl("");

      // Simulate connection
      setTimeout(() => {
        setInstances((prev) =>
          prev.map((instance) =>
            instance.id === newInstance.id
              ? { ...instance, status: "connected" }
              : instance,
          ),
        );
      }, 2000);
    }
  };

  const removeInstance = (id: string) => {
    setInstances(instances.filter((instance) => instance.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <Server className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Setup Wakapi Instances</h3>
        <p className="mx-auto max-w-md text-gray-600">
          Connect additional Wakapi instances to aggregate data from multiple
          sources.
        </p>
      </div>

      <Alert variant="info">
        <div>
          <strong>What is Wakapi?</strong>
          <p className="mt-1 text-sm">
            Wakapi is an open-source, self-hosted alternative to WakaTime. You
            can connect multiple instances to centralize your coding statistics.
          </p>
        </div>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Connected Instances</h4>

        {instances.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-gray-500">
            <Server className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm">No Wakapi instances connected yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {instances.map((instance) => (
              <div
                key={instance.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      instance.status === "connected"
                        ? "bg-green-500"
                        : instance.status === "connecting"
                          ? "animate-pulse bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{instance.name}</p>
                    <p className="text-sm text-gray-500">{instance.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {instance.status === "connected" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => removeInstance(instance.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h4 className="mb-4 font-semibold">Add New Instance</h4>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="instance-url"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Wakapi Instance URL
            </label>
            <div className="flex gap-2">
              <input
                id="instance-url"
                type="url"
                value={newInstanceUrl}
                onChange={(e) => setNewInstanceUrl(e.target.value)}
                placeholder="https://your-wakapi-instance.com"
                className="flex-1 rounded-md border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={addInstance} disabled={!newInstanceUrl}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <h5 className="mb-2 text-sm font-medium">
              Popular Wakapi Instances
            </h5>
            <div className="space-y-2">
              <button
                onClick={() => setNewInstanceUrl("https://wakapi.dev")}
                className="block text-sm text-blue-600 hover:underline"
              >
                https://wakapi.dev (Official public instance)
              </button>
              <button
                onClick={() => setNewInstanceUrl("https://waka.hackclub.com")}
                className="block text-sm text-blue-600 hover:underline"
              >
                https://waka.hackclub.com (Hack Club instance)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h4 className="mb-4 font-semibold">Self-Host Your Own Wakapi</h4>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Want to host your own Wakapi instance? It&apos;s easy to set up with
            Docker:
          </p>

          <CodeBlock title="Docker Compose">
            {`version: '3.8'
services:
  wakapi:
    image: ghcr.io/muety/wakapi:latest
    ports:
      - "3000:3000"
    environment:
      WAKAPI_DB_TYPE: sqlite3
      WAKAPI_DB_NAME: /data/wakapi.db
    volumes:
      - wakapi_data:/data

volumes:
  wakapi_data:`}
          </CodeBlock>

          <Button variant="neutral" asChild>
            <a
              href="https://github.com/muety/wakapi"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Wakapi Documentation
            </a>
          </Button>
        </div>
      </div>

      <Alert variant="success">
        <div>
          <strong>Optional Step</strong>
          <p className="mt-1 text-sm">
            Wakapi instances are optional. You can skip this step and use only
            WakaTime, or add instances later from your dashboard settings.
          </p>
        </div>
      </Alert>
    </div>
  );
}
