import { validateFormat } from "@/lib/auth/api-key/validator";
import { supabaseService } from "@/lib/database/supabase/service-server";
import { generateScript } from "@/shared/scripts/installer/execute";
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

  if (!validateFormat(token)) {
    return new Response("Invalid token format", { status: 400 });
  }

  const script = await generateScript(
    file === "setup.ps1" ? "powershell" : "shell",
    token,
  );

  return new Response(script, {
    headers: {
      "Content-Type": file === "setup.sh" ? "text/x-sh" : "text/x-powershell",
    },
  });
}
