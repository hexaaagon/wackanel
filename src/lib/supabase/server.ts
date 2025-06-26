import { headers, cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/shared/types/supabase";
import { auth } from "@/lib/auth";

export const createClient = async (
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) => {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.id) {
      await supabase.rpc("set_user_id", { user_id: session.user.id });
    }
  } catch (error) {
    console.error("Failed to set user ID for RLS:", error);
  }

  return supabase;
};
