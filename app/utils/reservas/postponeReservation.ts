import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { RESERVATION_STATUS } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  applyEquipmentClosingReadings,
  type UnitClosingReading,
} from "./closeEquipmentReadings";

export type { UnitClosingReading } from "./closeEquipmentReadings";

/**
 * US-RES-020: a reservation still `scheduled` moves to any new date/time —
 * the story allows "el motivo que sea", but `reservations` has no column to
 * hold that text (only `cancellation_reason` exists, for US-RES-021), so
 * nothing here pretends to save one.
 */
export const postponeScheduledReservation = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  newStartsAt: string,
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("reservations")
    .update({
      starts_at: newStartsAt,
      updated_by: workerId,
    })
    .eq("id", reservationId)
    .eq("status", RESERVATION_STATUS.SCHEDULED);
  throwIfSupabaseError(
    error,
    "reservas.postponeReservation.postponeScheduledReservation"
  );
};

/**
 * US-RES-020: a `dispatched` reservation only postpones for weather — the
 * equipment closes right now, registering what actually came back (fuel,
 * hours/kilometers, via `applyEquipmentClosingReadings` — the same write
 * US-OPE-009's real close uses), and the reservation returns to `scheduled`
 * with the new date. The charge and deposit are untouched on purpose: the
 * story is explicit that the client is never billed again.
 */
export const postponeDispatchedReservation = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  newStartsAt: string,
  closings: UnitClosingReading[],
  workerId: string
): Promise<void> => {
  await applyEquipmentClosingReadings(
    supabase,
    closings,
    workerId
  );

  const { error } = await supabase
    .from("reservations")
    .update({
      dispatched_at: null,
      starts_at: newStartsAt,
      status: RESERVATION_STATUS.SCHEDULED,
      updated_by: workerId,
    })
    .eq("id", reservationId)
    .eq("status", RESERVATION_STATUS.DISPATCHED);
  throwIfSupabaseError(
    error,
    "reservas.postponeReservation.postponeDispatchedReservation"
  );
};
