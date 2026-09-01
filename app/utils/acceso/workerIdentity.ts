import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { STRING } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface WorkerIdentity {
  fullName: string;
  username: string;
}

/**
 * The signed-in worker's own display name and login username, read
 * client-side for the always-reachable `AppDrawer` — the same account the
 * session already belongs to, gated by the same `workers_select` RLS
 * policy `fetchWorkerAreaState` relies on.
 */
export const fetchWorkerIdentity = async (
  supabase: SupabaseClient<Database>,
  workerId: string
): Promise<WorkerIdentity> => {
  const { data, error } = await supabase
    .from("workers")
    .select("full_name, username")
    .eq("id", workerId)
    .maybeSingle();
  throwIfSupabaseError(
    error,
    "workerIdentity.fetchWorkerIdentity"
  );

  return {
    fullName: data?.full_name ?? STRING.Empty,
    username: data?.username ?? STRING.Empty,
  };
};
