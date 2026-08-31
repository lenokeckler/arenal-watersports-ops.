import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

const NO_IDS = 0;

/**
 * RNF-023: every operations history shows who signed the record, and
 * `workers_select` deliberately keeps a colleague's row private. The
 * `worker_display_names` function is the one crack that opens — the name
 * and nothing else — so every history under `/operaciones` resolves its
 * signatures through here instead of embedding `workers`, which would come
 * back null for anyone without the `guia` mark.
 */
export const fetchWorkerNames = async (
  supabase: SupabaseClient<Database>,
  workerIds: string[]
): Promise<Map<string, string>> => {
  const uniqueIds = [...new Set(workerIds)];

  if (uniqueIds.length === NO_IDS) {
    return new Map();
  }

  const { data, error } = await supabase.rpc(
    "worker_display_names",
    { p_worker_ids: uniqueIds }
  );
  throwIfSupabaseError(
    error,
    "operaciones.workerNames.fetchWorkerNames"
  );

  return new Map(
    (data ?? []).map((row) => [
      row.worker_id,
      row.full_name,
    ])
  );
};
