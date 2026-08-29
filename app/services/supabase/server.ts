import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE } from "@/app/constants";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Must be created per request: the cookie store is not shareable between them.
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE.URL,
    SUPABASE.ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              }
            );
          } catch {
            // Called from a Server Component: the middleware
            // refreshes the session, so this can be ignored.
          }
        },
      },
    }
  );
};
