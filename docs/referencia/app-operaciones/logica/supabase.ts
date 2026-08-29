import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      // keep the session on each device until the user signs out
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'arenal-ops-auth',
    },
  },
);
