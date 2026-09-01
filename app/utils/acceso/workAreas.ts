import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import type { WorkArea } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/**
 * A worker with exactly one enabled area has no mode to choose: that area
 * is their mode.
 */
const SINGLE_AREA = 1;

export interface WorkerAreaState {
  areas: WorkArea[];
  lastWorkArea: WorkArea | null;
}

/**
 * Reads which areas a worker has enabled and which one they used last
 * (US-ACC-011, section 8 of the access module design). Shared between the
 * work-mode page (a Server Component, session-scoped client) and the
 * global `AppDrawer` (a Client Component, browser client) so the
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
  throwIfSupabaseError(
    workerResult.error,
    "workAreas.fetchWorkerAreaState.worker"
  );
  throwIfSupabaseError(
    areasResult.error,
    "workAreas.fetchWorkerAreaState.areas"
  );

  return {
    areas: (areasResult.data ?? []).map((row) => row.area),
    lastWorkArea: workerResult.data?.last_work_area ?? null,
  };
};

/**
 * Which area a worker is actually working in right now.
 *
 * `last_work_area` is only ever written when someone picks a mode, and the
 * proxy only sends a worker to the mode selector when they have more than
 * one area (rule 4 of `proxy.ts`). So a worker with a single area — which is
 * most of them, and the seeded `admin` account — never had a mode at all:
 * `activeArea` stayed null, `BottomNav` rendered nothing, and the compact
 * switcher only offers mode buttons above one area, so there was no way to
 * set one from the interface either. The whole app was left with no
 * navigation, which is exactly what US-TAB-004 asks for.
 *
 * Falling back to the only area they have is not a default dressed up as a
 * choice: with one area there is no choice to make.
 */
export const resolveActiveWorkArea = (
  state: WorkerAreaState
): WorkArea | null => {
  if (state.lastWorkArea) {
    return state.lastWorkArea;
  }

  return state.areas.length === SINGLE_AREA
    ? state.areas[0]
    : null;
};
