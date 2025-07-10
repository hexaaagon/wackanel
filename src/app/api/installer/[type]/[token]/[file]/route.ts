import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      type: "wakatime" | string;
      token: string;
      file: `setup.${"ps1" | "sh"}`;
    }>;
  },
) {
  // eslint-disable-next-line prefer-const
  let { type, token, file } = await params;

  if (type !== "wakatime") {
    return new Response("Invalid type", { status: 400 });
  }

  if (!token || !file) {
    return new Response("Missing parameters", { status: 400 });
  }

  if (!["setup.ps1", "setup.sh"].includes(file)) {
    return new Response("Invalid file", { status: 400 });
  }

  token = atob(token);

  const isShell = file === "setup.sh";
  const script = isShell
    ? `#!/bin/sh\necho "coming soon"`
    : `Write-Output "coming soon"`;

  return new Response(script, {
    headers: {
      "Content-Type": isShell ? "text/x-sh" : "text/x-powershell",
    },
  });
}
