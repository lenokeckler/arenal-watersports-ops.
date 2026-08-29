export const SUPABASE = {
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  /**
   * Only for server routes that must bypass RLS with the service role:
   * counting failed login attempts, sending recovery PINs, resetting
   * passwords. Never read this from a Client Component.
   */
  SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
} as const;
