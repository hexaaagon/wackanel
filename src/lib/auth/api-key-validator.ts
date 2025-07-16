import { createServiceServer } from "@/lib/db_supabase/service-server";

export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    if (!apiKey) {
      return { valid: false, error: "API key is required" };
    }

    const supabase = createServiceServer();

    // Extract prefix and key parts
    const parts = apiKey.split("_");
    if (parts.length !== 2) {
      return { valid: false, error: "Invalid API key format" };
    }

    const [prefix, key] = parts;

    // Query the database to validate the API key
    const { data: apiKeyData, error } = await supabase
      .from("apikey")
      .select("user_id, enabled")
      .eq("prefix", prefix + "_")
      .eq("key", key)
      .single();

    if (error || !apiKeyData) {
      return { valid: false, error: "Invalid API key" };
    }

    if (!apiKeyData.enabled) {
      return { valid: false, error: "API key is disabled" };
    }

    return {
      valid: true,
      userId: apiKeyData.user_id,
    };
  } catch (error) {
    console.error("Error validating API key:", error);
    return { valid: false, error: "Internal server error" };
  }
}
