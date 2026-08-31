import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { WORK_AREA, WORKER_STATUS } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface ReservationsPermissionState {
  /** Mirrors `items_update`/`items_delete`'s own RLS condition. */
  canManageReservationItems: boolean;
  isActive: boolean;
}

/**
 * Mirrors `has_area('reservas') or has_area('operaciones') or is_admin()`
 * (the exact condition `items_update` grants) in application code — needed
 * because the item-removal route runs on the service-role client, which
 * bypasses RLS entirely, so the permission check the database would
 * otherwise make has to happen here instead.
 */
export const fetchReservationsPermissionState = async (
  supabase: SupabaseClient<Database>,
  workerId: string
): Promise<ReservationsPermissionState> => {
  const [workerResult, areasResult] = await Promise.all([
    supabase
      .from("workers")
      .select("status, expires_at")
      .eq("id", workerId)
      .maybeSingle(),
    supabase
      .from("worker_areas")
      .select("area")
      .eq("worker_id", workerId),
  ]);
  throwIfSupabaseError(
    workerResult.error,
    "reservas.reservationsPermissions.fetchReservationsPermissionState.worker"
  );
  throwIfSupabaseError(
    areasResult.error,
    "reservas.reservationsPermissions.fetchReservationsPermissionState.areas"
  );

  const isActive =
    workerResult.data?.status === WORKER_STATUS.ACTIVE &&
    (!workerResult.data.expires_at ||
      new Date(workerResult.data.expires_at) > new Date());

  if (!isActive) {
    return {
      canManageReservationItems: false,
      isActive: false,
    };
  }

  const areas = (areasResult.data ?? []).map(
    (row) => row.area
  );

  return {
    canManageReservationItems:
      areas.includes(WORK_AREA.RESERVATIONS) ||
      areas.includes(WORK_AREA.OPERATIONS) ||
      areas.includes(WORK_AREA.ADMINISTRATION),
    isActive: true,
  };
};
