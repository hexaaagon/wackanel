import { createClient } from "@supabase/supabase-js";
import { Database } from "@/shared/types/supabase";

/**
 * WARNING: DON'T USE THIS ON CLIENT COMPONENTS
 *
 * Creates a Supabase client with service role privileges that bypasses RLS.
 * This client should NEVER be used on the client side or exposed to users.
 */
export const createServiceServer = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      // Ensure we're always using the service role key in Authorization header
      global: {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    },
  );
};
