import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  WORK_AREA,
  WORKER_MARK,
  WORKER_STATUS,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface WorkerPermissionState {
  isActive: boolean;
  isAdmin: boolean;
  /** US-ADM-005: reservas with the `registro_guias_externos` mark. */
  isExternalGuideRegistrar: boolean;
}

/**
 * Mirrors `has_area` / `has_mark` / `is_admin` (section "Identidad" of
 * `supabase/migrations/20260828000200_identity_access.sql`) in application
 * code: a blocked or expired account counts as having no area and no mark,
 * exactly like the database functions this shadows. Needed wherever a
 * privileged route runs on the service-role client — which bypasses RLS
 * entirely — so the permission check the database would otherwise make
 * has to happen here instead.
 */
export const fetchWorkerPermissionState = async (
  supabase: SupabaseClient<Database>,
  workerId: string
): Promise<WorkerPermissionState> => {
  const [workerResult, areasResult, marksResult] =
    await Promise.all([
      supabase
        .from("workers")
        .select("status, expires_at")
        .eq("id", workerId)
        .maybeSingle(),
      supabase
        .from("worker_areas")
        .select("area")
        .eq("worker_id", workerId),
      supabase
        .from("worker_marks")
        .select("mark")
        .eq("worker_id", workerId),
    ]);
  throwIfSupabaseError(
    workerResult.error,
    "workerPermissions.fetchWorkerPermissionState.worker"
  );
  throwIfSupabaseError(
    areasResult.error,
    "workerPermissions.fetchWorkerPermissionState.areas"
  );
  throwIfSupabaseError(
    marksResult.error,
    "workerPermissions.fetchWorkerPermissionState.marks"
  );

  const isActive =
    workerResult.data?.status === WORKER_STATUS.ACTIVE &&
    (!workerResult.data.expires_at ||
      new Date(workerResult.data.expires_at) > new Date());

  if (!isActive) {
    return {
      isActive: false,
      isAdmin: false,
      isExternalGuideRegistrar: false,
    };
  }

  const areas = (areasResult.data ?? []).map(
    (row) => row.area
  );
  const marks = (marksResult.data ?? []).map(
    (row) => row.mark
  );

  return {
    isActive: true,
    isAdmin: areas.includes(WORK_AREA.ADMINISTRATION),
    isExternalGuideRegistrar:
      areas.includes(WORK_AREA.RESERVATIONS) &&
      marks.includes(
        WORKER_MARK.EXTERNAL_GUIDE_REGISTRATION
      ),
  };
};
