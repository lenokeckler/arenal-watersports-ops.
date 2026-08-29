import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import type { WorkArea } from "@/app/constants";

export interface WorkerAreaState {
  areas: WorkArea[];
  lastWorkArea: WorkArea | null;
}

/**
 * Reads which areas a worker has enabled and which one they used last
 * (US-ACC-011, section 8 of the access module design). Shared between the
 * work-mode page (a Server Component, session-scoped client) and the
 * global `WorkAreaSwitcher` (a Client Component, browser client) so the
 * "more than one area" rule is computed the same way in both places.
 * RLS already lets a worker read their own `workers` and `worker_areas`
 * rows (`workers_select`, `worker_areas_select`), so no service role is
 * needed here.
 */
export const fetchWorkerAreaState = async (
  supabase: SupabaseClient<Database>,
  workerId: string
): Promise<WorkerAreaState> => {
  const [workerResult, areasResult] = await Promise.all([
    supabase
      .from("workers")
      .select("last_work_area")
      .eq("id", workerId)
      .maybeSingle(),
    supabase
      .from("worker_areas")
      .select("area")
      .eq("worker_id", workerId),
  ]);

  return {
    areas: (areasResult.data ?? []).map((row) => row.area),
    lastWorkArea: workerResult.data?.last_work_area ?? null,
  };
};
