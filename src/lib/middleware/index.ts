/* eslint-disable @typescript-eslint/no-unused-expressions */
import { NextResponse } from "next/server";
import createMiddlewareAuthClient from "./auth";

export type SupabaseMiddleware = ReturnType<typeof createMiddlewareAuthClient>;

export default async function middleware(
  request: SupabaseMiddleware["request"],
  nextResponse: SupabaseMiddleware["nextResponse"],
  supabase: SupabaseMiddleware["supabase"],
  sessionCookie: SupabaseMiddleware["sessionCookie"],
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const hasSession = !!sessionCookie;
  const development = process.env.NODE_ENV === "development";

  if (development) {
    console.log(`Middleware - Path: ${pathname}, HasSession: ${hasSession}`);
  }

  if ((pathname === "/" || pathname === "/auth/sign-in") && hasSession) {
    development &&
      console.log("Middleware - Redirecting to dashboard (has session)");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    (pathname.startsWith("/dashboard") || pathname === "/auth/sign-out") &&
    !hasSession
  ) {
    development &&
      console.log("Middleware - Redirecting to landing (no session)");
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/dashboard/setup") && hasSession) {
    try {
      const setup = await (
        await import("./setup")
      ).default(request, nextResponse, supabase, sessionCookie);

      if (setup !== "no-action") return setup;
    } catch (error) {
      console.error("Setup middleware error:", error);
    }
  }

  return nextResponse;
}
