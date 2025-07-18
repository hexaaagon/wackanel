import { Database } from "@/shared/types/supabase";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export default function createMiddlewareAuthClient(request: NextRequest) {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const sessionCookie = getSessionCookie(request);

  // Debug: Log session cookie status
  if (process.env.NODE_ENV === "development") {
    console.log(
      "Middleware - Session cookie:",
      sessionCookie ? "Present" : "Missing",
    );
    console.log(
      "Middleware - All cookies:",
      request.cookies.getAll().map((c) => c.name),
    );
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return {
    supabase,
    request,
    nextResponse: supabaseResponse,
    sessionCookie,
  };
}
