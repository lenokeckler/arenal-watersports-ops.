import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import { RESERVATION_STATUS } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

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

export interface UnitClosingReading {
  fuelPercent: Nullable<number>;
  itemId: string;
  unitId: string;
  usageReading: Nullable<number>;
}

const closeReservationItem = async (
  supabase: SupabaseClient<Database>,
  reading: UnitClosingReading,
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("reservation_items")
    .update({
      fuel_in: reading.fuelPercent,
      updated_by: workerId,
      usage_in: reading.usageReading,
    })
    .eq("id", reading.itemId);
  throwIfSupabaseError(
    error,
    "reservas.postponeReservation.closeReservationItem"
  );
};

const closeEquipmentUnit = async (
  supabase: SupabaseClient<Database>,
  reading: UnitClosingReading,
  workerId: string
): Promise<void> => {
  const patch: {
    current_fuel?: number;
    updated_by: string;
    usage_total?: number;
  } = { updated_by: workerId };
  if (reading.fuelPercent !== null) {
    patch.current_fuel = reading.fuelPercent;
  }
  if (reading.usageReading !== null) {
    patch.usage_total = reading.usageReading;
  }

  const { error } = await supabase
    .from("equipment_units")
    .update(patch)
    .eq("id", reading.unitId);
  throwIfSupabaseError(
    error,
    "reservas.postponeReservation.closeEquipmentUnit"
  );
};

/**
 * US-RES-020: a `dispatched` reservation only postpones for weather — the
 * equipment closes right now, registering what actually came back (fuel,
 * hours/kilometers), and the reservation returns to `scheduled` with the
 * new date. The charge and deposit are untouched on purpose: the story is
 * explicit that the client is never billed again.
 */
export const postponeDispatchedReservation = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  newStartsAt: string,
  closings: UnitClosingReading[],
  workerId: string
): Promise<void> => {
  await Promise.all(
    closings.flatMap((reading) => [
      closeReservationItem(supabase, reading, workerId),
      closeEquipmentUnit(supabase, reading, workerId),
    ])
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
