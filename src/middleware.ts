import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/auth/sign-in"
  ) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } else if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname === "/auth/sign-out"
  ) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } else {
    return NextResponse.next();
  }
}
