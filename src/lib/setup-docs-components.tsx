import {
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
  Copy,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AlertProps {
  children: React.ReactNode;
  variant?: "info" | "warning" | "success" | "danger";
  className?: string;
}

export function Alert({
  children,
  variant = "info",
  className = "",
}: AlertProps) {
  const variants = {
    info: "bg-blue-50 border-l-4 border-blue-500 text-blue-800",
    warning: "bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800",
    success: "bg-green-50 border-l-4 border-green-500 text-green-800",
    danger: "bg-red-50 border-l-4 border-red-500 text-red-800",
  };

  const icons = {
    info: <Info className="h-5 w-5 text-blue-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    danger: <AlertCircle className="h-5 w-5 text-red-600" />,
  };

  return (
    <div className={`rounded-lg p-4 ${variants[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        {icons[variant]}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
}

export function CodeBlock({
  children,
  language = "bash",
  title,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-full overflow-hidden rounded-lg bg-gray-900">
      {title && (
        <div className="border-b border-gray-700 bg-gray-800 px-4 py-2 text-xs text-gray-300 md:text-sm">
          {title}
        </div>
      )}
      <div className="relative">
        <pre className="max-w-full overflow-x-clip p-4 text-xs text-green-400 md:text-sm">
          <code>{children}</code>
        </pre>
        <Button
          variant="neutral"
          size="sm"
          onClick={handleCopy}
          className="absolute top-2 right-2 h-8 w-8 p-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
        {copied && (
          <div className="absolute top-2 right-12 rounded bg-green-600 px-2 py-1 text-xs text-white">
            Copied!
          </div>
        )}
      </div>
    </div>
  );
}

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  isActive?: boolean;
}

export function StepCard({
  icon,
  title,
  description,
  children,
  isActive = false,
}: StepCardProps) {
  return (
    <>
      <div
        className={`hidden rounded-lg border p-6 transition-all duration-200 md:block ${
          isActive ? "border-blue-300 bg-blue-50/50" : "hover:shadow-lg"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`rounded-full p-3 ${
              isActive ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h4 className="mb-2 font-semibold">{title}</h4>
            <p className="mb-4 text-sm text-gray-600">{description}</p>
            {children}
          </div>
        </div>
      </div>
      <div
        className={`block rounded-lg border p-6 transition-all duration-200 md:hidden ${
          isActive ? "border-blue-300 bg-blue-50/50" : "hover:shadow-lg"
        }`}
      ></div>
    </>
  );
}

interface ExternalLinkButtonProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLinkButton({
  href,
  children,
}: ExternalLinkButtonProps) {
  return (
    <Button variant="neutral" size="sm" asChild>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2"
      >
        {children}
        <ExternalLink className="h-4 w-4" />
      </a>
    </Button>
  );
}

interface DeviceDetectionProps {
  userAgent?: string;
}

export function DeviceDetection({ userAgent }: DeviceDetectionProps) {
  // Mock device detection - in real app this would use actual user agent
  const detectedOS = "macOS"; // Could be "Windows", "Linux", "macOS"
  const detectedEditor = "VS Code"; // Could be "VS Code", "IntelliJ", "Vim", etc.

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <h5 className="mb-2 font-medium">🔍 Detected Environment</h5>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Operating System:</span>
          <span className="font-medium">{detectedOS}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Likely Editor:</span>
          <span className="font-medium">{detectedEditor}</span>
        </div>
      </div>
    </div>
  );
}
