import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE } from "@/app/constants";

/**
 * Supabase client for Client Components.
 * Reads the session from the browser cookies written by the server client.
 */
export const createClient = () =>
  createBrowserClient(SUPABASE.URL, SUPABASE.ANON_KEY);
