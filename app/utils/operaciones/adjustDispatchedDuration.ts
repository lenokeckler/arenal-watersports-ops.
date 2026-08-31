import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { RESERVATION_STATUS } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

const NO_MINUTES = 0;

/**
 * US-OPE-006: only an extension marks the reservation for reservas to
 * weigh billing — a shorter duration is just a smaller countdown, never a
 * courtesy or a charge either way.
 */
export const computeExtendedMinutes = (
  previousDurationMinutes: number,
  newDurationMinutes: number
): number =>
  Math.max(
    newDurationMinutes - previousDurationMinutes,
    NO_MINUTES
  );

export interface AdjustDispatchedDurationParams {
  currentExtraTimeMinutes: number;
  newDurationMinutes: number;
  previousDurationMinutes: number;
  reservationId: string;
  workerId: string;
}

/**
 * US-OPE-006: extends or trims a dispatched reservation's duration.
 * `ends_at` is a generated column, so writing `duration_minutes` recomputes
 * the return time — and the board — on its own. Operaciones never decides
 * whether the extra time gets charged; it only leaves the count in
 * `extra_time_minutes` for reservas to read (US-RES-031 already does).
 */
export const adjustDispatchedDuration = async (
  supabase: SupabaseClient<Database>,
  params: AdjustDispatchedDurationParams
): Promise<void> => {
  const extendedMinutes = computeExtendedMinutes(
    params.previousDurationMinutes,
    params.newDurationMinutes
  );

  const { error } = await supabase
    .from("reservations")
    .update({
      duration_minutes: params.newDurationMinutes,
      extra_time_minutes:
        params.currentExtraTimeMinutes + extendedMinutes,
      updated_by: params.workerId,
    })
    .eq("id", params.reservationId)
    .eq("status", RESERVATION_STATUS.DISPATCHED);
  throwIfSupabaseError(
    error,
    "operaciones.adjustDispatchedDuration.adjustDispatchedDuration"
  );
};
