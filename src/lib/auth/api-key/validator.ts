import { supabaseService } from "@/lib/database/supabase/service-server";
import { apiKeyValidationCache } from "@/lib/backend/cache/auth";
import { generateCacheKey } from "@/lib/backend/cache/utils";
import { generateString } from "./generate";

export function validateFormat(apiKey: string): boolean {
  const parts = apiKey.split(".");
  return (
    parts.length === 3 &&
    parts.every((part) => part.length > 0) &&
    parts[2].length === 48
  );
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
  const [userId, timestampHash, randomPart] = apiKey.split(".");

  if (!userId || !timestampHash || !randomPart)
    return {
      valid: false,
      error: "Invalid API key format - 01",
    };

  if (!validateFormat(apiKey))
    return {
      valid: false,
      error: "Invalid API key format - 02",
    };

  const cacheKey = generateCacheKey("editorApiKey", apiKey);
  const cachedResult = apiKeyValidationCache.get(cacheKey);

  console.log(cachedResult);
  if (cachedResult) return cachedResult;

  const { data, error } = await supabaseService
    .from("editor_apikey")
    .select("key")
    .eq("user_id", userId)
    .single();

  if (error || !data?.key) {
    const result = {
      valid: false as const,
      error: error?.message || "API key not found",
    };
    apiKeyValidationCache.set(cacheKey, result);

    return result;
  }

  const result =
    data.key === apiKey
      ? {
          valid: true as const,
          userId: data.key,
        }
      : {
          valid: false as const,
          error: "Invalid API key",
        };

  apiKeyValidationCache.set(cacheKey, result);
  return result;
}
