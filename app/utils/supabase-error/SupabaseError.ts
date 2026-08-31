import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Wraps a real Supabase/PostgREST failure with the identity of the query
 * that produced it. The message is for the server log only — `app/error.tsx`
 * renders a generic Spanish message to the worker, never this one, so it is
 * safe (and useful) to keep the raw Postgrest code and message here.
 */
export class SupabaseQueryError extends Error {
  constructor(operation: string, cause: PostgrestError) {
    super(
      `Supabase query failed: ${operation} — ${cause.message} (${cause.code})`
    );
    this.name = "SupabaseQueryError";
    this.cause = cause;
  }
}

/**
 * Every `{ data, error }` read in the data layer must pass its `error`
 * through this before touching `data`. This is the fix for the defect
 * documented in `docs/decisiones/ESTADO-ACTUAL.md`: an unqualified
 * `worker_areas(area)` embed failed every request with `PGRST201`, and
 * because nobody checked `error`, `fetchWorkersPage` rendered that failure
 * as "no hay trabajadores" instead of surfacing it.
 *
 * `.maybeSingle()` returning zero rows is a legitimate empty result — it
 * reports `data: null, error: null` — so it still passes through here
 * without throwing. Only a real query failure (a bad embed, a missing
 * column, a permissions error, …) carries a non-null `error`.
 *
 * `operation` identifies which query failed, e.g. `"workers.fetchWorkerDetail"`.
 */
export const throwIfSupabaseError = (
  error: PostgrestError | null,
  operation: string
): void => {
  if (error) {
    throw new SupabaseQueryError(operation, error);
  }
};
