import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { RESERVATION_STATUS } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/**
 * US-RES-021/US-RES-022: cancels a reservation with a mandatory reason —
 * the only write either story needs. Nothing here touches equipment or
 * `reservation_items`: a `scheduled` reservation never held equipment out
 * on the water, and a `dispatched` one deliberately leaves the fuel/usage
 * reading for operaciones to fill in later (US-RES-022's own criterion —
 * no constraint here blocks that later write). The unit reads as free
 * again on its own: `unit_current_state` only counts a `dispatched`
 * reservation as an active trip, and this reservation stops being one the
 * moment its status changes.
 */
export const cancelReservation = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  reason: string,
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("reservations")
    .update({
      cancellation_reason: reason,
      status: RESERVATION_STATUS.CANCELLED,
      updated_by: workerId,
    })
    .eq("id", reservationId);
  throwIfSupabaseError(
    error,
    "reservas.cancelReservation.cancelReservation"
  );
};
