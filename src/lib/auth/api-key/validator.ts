import { supabaseService } from "@/lib/database/supabase/service-server";
import { apiKeyValidationCache } from "@/lib/backend/cache/auth";
import { generateCacheKey } from "@/lib/backend/cache/utils";
import { validate as uuidValidate } from "uuid";

export function validateFormat(apiKey: string): boolean {
  return uuidValidate(apiKey);
}

export async function validateEditorUser(apiKey: string): Promise<
  | {
      valid: true;
      userId: string;
    }
  | {
      valid: false;
      error: string;
    }
> {
  if (!validateFormat(apiKey))
    return {
      valid: false,
      error: "Invalid API key format",
    };

  const cacheKey = generateCacheKey("editorApiKey", apiKey);
  const cachedResult = apiKeyValidationCache.get(cacheKey);

  console.log(cachedResult);
  if (cachedResult) return cachedResult;

  const { data, error } = await supabaseService
    .from("editor_apikey")
    .select("key, user_id")
    .eq("key", apiKey)
    .single();

  if (error || !data?.key) {
    const result = {
      valid: false as const,
      error: error?.message || "API key not found",
    };
    apiKeyValidationCache.set(cacheKey, result);

    return result;
  }

  const result = {
    valid: true as const,
    userId: data.user_id,
  };

  apiKeyValidationCache.set(cacheKey, result);
  return result;
}
