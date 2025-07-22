import { supabaseService } from "@/lib/database/supabase/service-server";
import { customAlphabet, nanoid } from "nanoid";

const generateToken = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  48,
);
const customEpoch = 1735689600;

function base64urlEncode(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function hashTimestamp(timestamp: number) {
  const customTime = Math.floor(timestamp / 1000) - customEpoch;
  const hex = customTime.toString(16);
  return base64urlEncode(hex);
}

export function generateString(userId: string, timestamp = Date.now()) {
  const timestampHash = hashTimestamp(timestamp);
  const randomPart = generateToken();

  return `${userId}.${timestampHash}.${randomPart}`;
}

export async function generateEditorKey(userId: string) {
  const { data, error } = await supabaseService
    .from("editor_apikey")
    .select("key")
    .eq("user_id", userId)
    .single();

  let key = data?.key;
  let type = "fetched";

  if (error || !key) {
    key = generateString(userId);
    type = "created";

    await supabaseService.from("editor_apikey").insert({
      id: nanoid(8),
      user_id: userId,

      key,

      created_at: new Date().toISOString(),
      last_request_at: new Date().toISOString(),
    });
  }

  return {
    valid: true,
    type,
    key,
  };
}
