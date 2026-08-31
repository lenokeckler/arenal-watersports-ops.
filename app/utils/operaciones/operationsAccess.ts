import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  WORK_AREA,
  WORKER_MARK,
  type WorkerMark,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";

export interface OperationsAccess {
  /** US-OPE-015: the `encargado_general` mark, plus administración. */
  canManageConditionPhotos: boolean;
  workerId: string;
}

/**
 * Every screen under `/operaciones` needs the operations area; the
 * condition photos need one thing more, and it is a mark on the account
 * rather than an area (RNF-013). Resolving both in one place keeps the
 * pages from each re-deriving what a mark means. This only decides what
 * renders — `photos_insert` and the storage policy reject the write on
 * their own however it arrives.
 */
export const requireOperationsWorker = async (
  supabase: SupabaseClient<Database>
): Promise<OperationsAccess> => {
  const { areas, workerId } = await requireWorkerWithAreas(
    supabase,
    [WORK_AREA.OPERATIONS]
  );

  const { data, error } = await supabase
    .from("worker_marks")
    .select("mark")
    .eq("worker_id", workerId);
  throwIfSupabaseError(
    error,
    "operaciones.operationsAccess.requireOperationsWorker"
  );

  const marks = (data ?? []).map(
    (row) => row.mark as WorkerMark
  );

  return {
    canManageConditionPhotos:
      marks.includes(WORKER_MARK.GENERAL_MANAGER) ||
      areas.includes(WORK_AREA.ADMINISTRATION),
    workerId,
  };
};
