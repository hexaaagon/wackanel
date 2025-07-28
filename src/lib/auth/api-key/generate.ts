import { supabaseService } from "@/lib/database/supabase/service-server";
import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";

export function generateString(userId: string, timestamp = Date.now()) {
  return uuidv4();
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
