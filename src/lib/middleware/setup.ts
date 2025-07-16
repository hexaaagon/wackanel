import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SupabaseMiddleware } from "@/lib/middleware";
import { createServiceServer } from "@/lib/db_supabase/service-server";

type SessionData = {
  user: { id: string };
  [key: string]: unknown;
};

type CacheEntry = {
  session: SessionData;
  timestamp: number;
};

const sessionCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 30 * 1000;

export default async function setupMiddleware(
  request: SupabaseMiddleware["request"],
  nextResponse: SupabaseMiddleware["nextResponse"],
  supabase: SupabaseMiddleware["supabase"],
  sessionCookie: SupabaseMiddleware["sessionCookie"],
): Promise<NextResponse | "no-action"> {
  if (!sessionCookie) return "no-action";

  const cookieKey = String(sessionCookie);
  const now = Date.now();
  const cached = sessionCache.get(cookieKey);

  let session: SessionData | null = null;

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    session = cached.session;
  } else {
    try {
      const response = await fetch(
        `${request.nextUrl.origin}/api/auth/get-session`,
        {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        },
      );

      if (!response.ok) return "no-action";

      session = (await response.json()) as SessionData;

      if (session?.user) {
        sessionCache.set(cookieKey, { session, timestamp: now });

        for (const [key, value] of sessionCache.entries()) {
          if (now - value.timestamp > CACHE_DURATION) {
            sessionCache.delete(key);
          }
        }
      }
    } catch (error) {
      console.error("Session fetch error:", error);
      return "no-action";
    }
  }

  if (!session?.user) return "no-action";
  if (
    request.nextUrl.searchParams.get("setup_completed") === "true" ||
    request.nextUrl.searchParams.get("reconnect") === "true"
  )
    return "no-action";

  try {
    const supabaseService = createServiceServer();
    const setup = await supabaseService
      .from("user_setup")
      .select("is_completed")
      .eq("user_id", session.user.id)
      .single();

    if (setup.error || !setup.data) return "no-action";

    if (setup.data.is_completed) {
      return NextResponse.redirect(
        new URL("/dashboard/setup?setup_completed=true", request.url),
      );
    }
  } catch (error) {
    console.error("Setup database error:", error);
    return "no-action";
  }

  return "no-action";
}
