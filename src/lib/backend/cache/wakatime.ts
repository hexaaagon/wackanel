import { LRUCache } from "lru-cache";

// API Key validation cache - 15 minutes TTL
export const apiKeyCache = new LRUCache<
  string,
  {
    userId?: string;
    valid: boolean;
    error?: string;
  }
>({
  max: 1000,
  ttl: 1000 * 60 * 15, // 15 minutes
});

// WakaTime external API response cache - 5 minutes TTL
export const wakatimeApiCache = new LRUCache<
  string,
  {
    data: unknown;
    timestamp: number;
    endpoint: string;
  }
>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

// Instance status cache - 2 minutes TTL
export const instanceStatusCache = new LRUCache<
  string,
  {
    online: boolean;
    lastChecked: number;
    error?: string;
  }
>({
  max: 100,
  ttl: 1000 * 60 * 2, // 2 minutes
});

// User profile cache - 30 minutes TTL
export const userProfileCache = new LRUCache<
  string,
  {
    profile: unknown;
    lastUpdated: number;
  }
>({
  max: 200,
  ttl: 1000 * 60 * 30, // 30 minutes
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

export function generateCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(":")}`;
}

export function clearAllCaches(): void {
  apiKeyCache.clear();
  wakatimeApiCache.clear();
  instanceStatusCache.clear();
  userProfileCache.clear();
  oauthTokenCache.clear();
}
