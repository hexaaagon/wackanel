import { LRUCache } from "lru-cache";

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

export function clearWakatimeCaches(): void {
  wakatimeApiCache.clear();
}

export const wakatimeInstanceStatusCache = new LRUCache<
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

export function clearInstanceCaches(): void {
  wakatimeInstanceStatusCache.clear();
}
