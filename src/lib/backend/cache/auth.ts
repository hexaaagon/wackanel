import { LRUCache } from "lru-cache";

// API Key validation cache - 15 minutes TTL
export const apiKeyValidationCache = new LRUCache<
  string,
  | {
      valid: true;
      userId: string;
    }
  | {
      valid: false;
      error: string;
    }
>({
  max: 1000,
  ttl: 1000 * 60 * 15, // 15 minutes
});

// OAuth token cache - 50 minutes TTL (tokens usually expire in 1 hour)
export const oauthTokenCache = new LRUCache<
  string,
  {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
  }
>({
  max: 500,
  ttl: 1000 * 60 * 50, // 50 minutes
});

export function clearAuthCaches(): void {
  apiKeyValidationCache.clear();
  oauthTokenCache.clear();
}
