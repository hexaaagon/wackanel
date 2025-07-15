import { NextRequest, NextResponse } from "next/server";
import createMiddlewareAuthClient from "./lib/middleware/auth";
import baseMiddleware from "./lib/middleware";
import {
  getCachedMiddlewareResponse,
  setCachedMiddlewareResponse,
  generateMiddlewareCacheKey,
} from "./lib/middleware/cache";

const STATIC_ROUTES = ["/_next", "/favicon.ico", "/images"];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (STATIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const cacheKey = generateMiddlewareCacheKey(request);

  const {
    request: req,
    nextResponse,
    supabase,
    sessionCookie,
  } = createMiddlewareAuthClient(request);

  const response = await baseMiddleware(
    req,
    nextResponse,
    supabase,
    sessionCookie,
  );

  if (request.method === "GET") {
    const isRedirect = response.status >= 300 && response.status < 400;
    const isNext = response.status === 200 && !isRedirect;

    const cacheValue = {
      shouldRedirect: isRedirect,
      redirectTo: isRedirect
        ? response.headers.get("location") || undefined
        : undefined,
      shouldNext: isNext,
    };

    setCachedMiddlewareResponse(cacheKey, cacheValue);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images/).*)",
  ],
};
