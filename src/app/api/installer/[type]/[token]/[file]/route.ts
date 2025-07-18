import { createServiceServer } from "@/lib/database/supabase/service-server";
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

  const [userId, apiKey] = token.split(".");

  if (!userId || !apiKey) {
    return new Response("Invalid token format - 01", { status: 400 });
  }

  const supabase = createServiceServer();

  const account = await supabase
    .from("user")
    .select("id")
    .eq("id", userId)
    .single();

  if (!account) {
    return new Response("Invalid token format - 02", { status: 400 });
  }

  const api = await supabase
    .from("apikey")
    .select("prefix, key")
    .eq("user_id", userId)
    .single()
    .then((res) => ({
      type: "fetched",
      key: `${res.data?.prefix}${res.data?.key}`,
      body: res,
    }));

  if (!api || !api.key) {
    return new Response("Invalid token format - 031", { status: 404 });
  } else if (api.key.split("_")[1] !== apiKey) {
    return new Response("Invalid token format - 032", { status: 403 });
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
