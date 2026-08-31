import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import { RESERVATION_STATUS } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/** US-OPE-003: the departure reading for one motorized/fuel-consuming item. */
export interface DispatchItemReading {
  fuelPercent: Nullable<number>;
  itemId: string;
  usageReading: Nullable<number>;
}

const writeDispatchReading = async (
  supabase: SupabaseClient<Database>,
  reading: DispatchItemReading,
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("reservation_items")
    .update({
      fuel_out: reading.fuelPercent,
      updated_by: workerId,
      usage_out: reading.usageReading,
    })
    .eq("id", reading.itemId);
  throwIfSupabaseError(
    error,
    "operaciones.dispatchReservation.writeDispatchReading"
  );
};

/**
 * US-OPE-002/US-OPE-003: the reservation already has everything it needs —
 * this only records the departure fuel/hours for the motorized items
 * (US-OPE-003 applies "solo a las categorías que llevan motor", so
 * `readings` only ever contains those) and flips the reservation to
 * `dispatched`. `unit_current_state` picks up "occupied" and the return
 * countdown from `dispatched_at`/`ends_at` on its own — nothing here
 * recomputes availability.
 */
export const dispatchReservation = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  readings: DispatchItemReading[],
  workerId: string
): Promise<void> => {
  await Promise.all(
    readings.map((reading) =>
      writeDispatchReading(supabase, reading, workerId)
    )
  );

  const { error } = await supabase
    .from("reservations")
    .update({
      dispatched_at: new Date().toISOString(),
      status: RESERVATION_STATUS.DISPATCHED,
      updated_by: workerId,
    })
    .eq("id", reservationId)
    .eq("status", RESERVATION_STATUS.SCHEDULED);
  throwIfSupabaseError(
    error,
    "operaciones.dispatchReservation.dispatchReservation"
  );
};
