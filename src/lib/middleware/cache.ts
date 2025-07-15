import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";

const middlewareCache = new LRUCache<
  string,
  {
    shouldRedirect: boolean;
    redirectTo?: string;
    shouldNext?: boolean;
  }
>({
  max: 1000,
  ttl: 1000 * 60 * 2,
});

export function getCachedMiddlewareResponse(
  request: NextRequest,
  key: string,
): {
  shouldRedirect: boolean;
  redirectTo?: string;
  shouldNext?: boolean;
} | null {
  return middlewareCache.get(key) || null;
}

export function setCachedMiddlewareResponse(
  key: string,
  value: {
    shouldRedirect: boolean;
    redirectTo?: string;
    shouldNext?: boolean;
  },
) {
  middlewareCache.set(key, value);
}

export function generateMiddlewareCacheKey(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams.toString();
  const userAgent = request.headers.get("user-agent") || "";

  // Create a simple hash-like key
  return `${pathname}:${searchParams}:${userAgent.substring(0, 50)}`;
}
