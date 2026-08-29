import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE } from "@/app/constants";
import type { Database } from "@/app/types";

/**
 * Supabase client for Client Components.
 * Reads the session from the browser cookies written by the server client.
 */
export const createClient = () =>
  createBrowserClient<Database>(
    SUPABASE.URL,
    SUPABASE.ANON_KEY
  );
