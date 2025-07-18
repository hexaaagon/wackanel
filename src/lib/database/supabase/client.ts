import { Database } from "@/shared/types/supabase";
import { createBrowserClient } from "@supabase/ssr";
import { authClient } from "@/lib/auth/client";

export const createClient = async () => {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  try {
    const { data: session } = await authClient.getSession();
    if (session?.user?.id) {
      await supabase.rpc("set_user_id", { user_id: session.user.id });
    }
  } catch (error) {
    console.error("Failed to get session or set user ID for RLS:", error);
  }

  return supabase;
};
