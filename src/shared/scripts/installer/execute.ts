"use server";
import fs from "node:fs/promises";
import path from "node:path";
import { absoluteUrl } from "@/lib/utils";

export const executeInstall = async (
  scriptUrl: string,
  token: string,
  apiKey?: string,
  apiUrl?: string,
) => ({
  powershell: `${apiKey ? `$env:WACKANEL_API_KEY="${apiKey}"; ` : ""}${apiUrl ? `$env:WACKANEL_API_URL="${apiUrl}"; ` : ""}powershell -ExecutionPolicy Bypass -Command "& {iwr ${scriptUrl}/api/installer/wakatime/${token}/setup.ps1 -UseBasicParsing | iex}"`,
  shell: `${apiKey ? `export WACKANEL_API_KEY="${apiKey}" && ` : ""}${apiUrl ? `export WACKANEL_API_URL="${apiUrl}" && ` : ""}bash <(curl -s ${scriptUrl}/api/installer/wakatime/${token}/setup.sh)`,
});

export async function generateScript(
  type: "powershell" | "shell" | "config",
  apiKey: string,
  apiUrl = absoluteUrl("/api/wakatime"),
) {
  let file: string;
  if (type === "powershell") {
    file = path.join(process.cwd(), "src/scripts/powershell.ps1");
  } else if (type === "shell") {
    file = path.join(process.cwd(), "src/scripts/shell.sh");
  } else if (type === "config") {
    file = path.join(process.cwd(), "src/scripts/plain.cfg");
  } else {
    throw new Error("Invalid script type. Use 'powershell' or 'shell'.");
  }

  let script = await fs.readFile(file, "utf8");
  if (!script) {
    throw new Error(`Script file ${file} not found or empty.`);
  }

  script = script.replaceAll("{{WACKANEL_API_URL}}", apiUrl);
  script = script.replaceAll("{{WACKANEL_API_KEY}}", apiKey);

  return script;
}
