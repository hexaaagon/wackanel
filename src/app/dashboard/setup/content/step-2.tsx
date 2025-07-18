import { Download, Code, Monitor, Zap } from "lucide-react";
import { CodeBlock } from "@/components/app/setup";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Step2() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <Download className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Install WakaTime</h3>
        <p className="mx-auto max-w-md text-gray-600">
          WakaTime tracks your coding time automatically. Install the extension
          for your favorite editor to get started.
        </p>
      </div>

      <div className="space-y-6">
        <Accordion
          type="single"
          collapsible
          defaultValue="vscode"
          className="space-y-2"
        >
          {/* VS Code */}
          <AccordionItem value="vscode">
            <AccordionTrigger>
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-200">
                  <Code className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Visual Studio Code</h4>
                  <p className="text-sm text-gray-500">Most popular choice</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  Install the WakaTime extension using the command line:
                </p>
                <CodeBlock language="bash" title="Install WakaTime Extension">
                  code --install-extension WakaTime.vscode-wakatime
                </CodeBlock>
                <p className="text-sm text-gray-700">
                  Or install manually through VS Code:
                </p>
                <ol className="list-inside list-decimal space-y-1 text-sm text-gray-700">
                  <li>Open Extensions view (Ctrl/Cmd+Shift+X)</li>
                  <li>Search for &ldquo;WakaTime&rdquo;</li>
                  <li>Click Install on the official WakaTime extension</li>
                  <li>Enter your API key when prompted</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* JetBrains */}
          <AccordionItem value="jetbrains">
            <AccordionTrigger>
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-200">
                  <Monitor className="h-7 w-7 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">JetBrains IDEs</h4>
                  <p className="text-sm text-gray-500">
                    IntelliJ, PyCharm, WebStorm, etc.
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <ol className="list-inside list-decimal space-y-2 text-sm text-gray-700">
                  <li>
                    Go to <strong>File → Settings → Plugins</strong> (or{" "}
                    <strong>IntelliJ IDEA → Preferences → Plugins</strong> on
                    macOS)
                  </li>
                  <li>Click the &ldquo;Marketplace&rdquo; tab</li>
                  <li>Search for &ldquo;WakaTime&rdquo;</li>
                  <li>Click Install and restart your IDE</li>
                  <li>Enter your API key when prompted</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Sublime Text */}
          <AccordionItem value="sublime">
            <AccordionTrigger>
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-200">
                  <Zap className="h-7 w-7 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Sublime Text</h4>
                  <p className="text-sm text-gray-500">Lightweight & fast</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <ol className="list-inside list-decimal space-y-2 text-sm text-gray-700">
                  <li>Install Package Control (if not already installed)</li>
                  <li>
                    Press <strong>Ctrl/Cmd+Shift+P</strong> to open the command
                    palette
                  </li>
                  <li>
                    Type &ldquo;Package Control: Install Package&rdquo; and
                    press Enter
                  </li>
                  <li>Search for &ldquo;WakaTime&rdquo; and install it</li>
                  <li>Restart Sublime Text and enter your API key</li>
                </ol>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Popular IDEs */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-3 font-semibold text-gray-900">Other Popular IDEs</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Android Studio</span>
            <span className="text-xs text-gray-500">Via JetBrains plugin</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Xcode</span>
            <span className="text-xs text-gray-500">
              Official plugin available
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Eclipse</span>
            <span className="text-xs text-gray-500">Marketplace plugin</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">NetBeans</span>
            <span className="text-xs text-gray-500">Plugin available</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Need help?</strong> After installing, you&apos;ll be prompted
          to enter your WakaTime API key. Don&apos;t worry - we&apos;ll help you
          get that in the next step!
        </p>
      </div>

      <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
        <h4 className="mb-2 font-semibold text-yellow-900">
          🔗 Can&apos;t find your editor?
        </h4>
        <p className="text-sm text-yellow-800">
          WakaTime supports 50+ editors and IDEs. Visit the{" "}
          <a
            href="https://wakatime.com/plugins"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            official plugins page
          </a>{" "}
          for installation instructions for Brackets, Light Table, Nova, and
          many more.
        </p>
      </div>
    </div>
  );
}
