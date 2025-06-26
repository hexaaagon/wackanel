import { NextResponse } from "next/server";
import createMiddlewareAuthClient from "./auth";

type SupabaseMiddleware = ReturnType<typeof createMiddlewareAuthClient>;

export default async function middleware(
  request: SupabaseMiddleware["request"],
  nextResponse: SupabaseMiddleware["nextResponse"],
  supabase: SupabaseMiddleware["supabase"],
  sessionCookie: SupabaseMiddleware["sessionCookie"],
): Promise<NextResponse> {
  if (
    (request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname === "/auth/sign-in") &&
    sessionCookie
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } else if (
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname === "/auth/sign-out") &&
    !sessionCookie
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return nextResponse;
}
