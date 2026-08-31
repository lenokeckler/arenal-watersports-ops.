import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { PATHS } from "@/app/constants";
import { fetchWorkerPermissionState } from "./workerPermissions";

/**
 * Every screen under `/administracion` (EP-ADM-01, EP-ADM-02) needs the
 * same gate: signed in, and holding the `administracion` area — checked
 * the same way `fetchWorkerPermissionState` checks it everywhere else, not
 * by trusting `base_role` alone, since US-ADM-002 lets that area be
 * granted as an addition to any account. RLS still enforces every write on
 * its own; this only decides whether the page renders at all.
 */
export const requireAdminWorker = async (
  supabase: SupabaseClient<Database>
): Promise<string> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  const { isAdmin } = await fetchWorkerPermissionState(supabase, user.id);

  if (!isAdmin) {
    redirect(PATHS.COMMON.DASHBOARD);
  }

  return user.id;
};
