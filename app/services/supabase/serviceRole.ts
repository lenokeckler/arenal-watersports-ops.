import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE } from "@/app/constants";
import type { Database } from "@/app/types";

/**
 * Supabase client with the service role key. Bypasses Row Level Security,
 * so it is only for server routes that a Client Component could never
 * perform on its own: counting failed login attempts and blocking an
 * account, sending the recovery PIN, and resetting a password with it.
 * Never import this from a Client Component or expose the key to the
 * browser.
 */
export const createClient = () =>
  createSupabaseClient<Database>(
    SUPABASE.URL,
    SUPABASE.SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
