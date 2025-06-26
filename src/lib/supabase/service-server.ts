import { createClient } from "@supabase/supabase-js";
import { Database } from "@/shared/types/supabase";

/**
 * WARNING: DON'T USE THIS ON CLIENT COMPONENTS
 */
export const createServiceServer = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
};
