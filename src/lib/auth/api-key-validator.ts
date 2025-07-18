import { apiKeyCache, generateCacheKey } from "@/lib/cache/wakatime";
import { auth } from ".";

// TODO: refactor this whole mess to use manual api key management
export async function validateApiKey(apiKey: string): Promise<
  | {
      valid: false;
      error: string;
    }
  | {
      valid: true;
      apiKey: Awaited<ReturnType<typeof auth.api.verifyApiKey>>;
    }
> {
  try {
    if (!apiKey) {
      return { valid: false, error: "API key is required" };
    }

    const cacheKey = generateCacheKey("api_key", apiKey);
    const cached = apiKeyCache.get(cacheKey);

    if (cached) {
      if (cached.valid) {
        // For cached valid results, we need to re-verify to get the full apiKey structure
        // since the cache only stores basic validation info
      } else {
        console.log("Using cached invalid API key result:", cached.error);
        return {
          valid: false as const,
          error: cached.error || "Invalid API key",
        };
      }
    }

    // if (apiKey.split("_").length !== 3 || !apiKey.startsWith("editor_")) {
    //   const result = { valid: false as const, error: "Invalid API key format" };
    //
    //   apiKeyCache.set(cacheKey, result);
    //   return result;
    // }

    const { valid, error, key } = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
      },
    });

    console.log(apiKey);

    if (error || !valid) {
      console.log("API key validation failed:", error, valid, key);
      const result = { valid: false as const, error: "Invalid API key" };

      apiKeyCache.set(cacheKey, result);
      return result;
    }

    const result = {
      valid: true as const,
      apiKey: { valid, error, key },
    };

    apiKeyCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error validating API key:", error);
    return { valid: false, error: "Internal server error" };
  }
}
