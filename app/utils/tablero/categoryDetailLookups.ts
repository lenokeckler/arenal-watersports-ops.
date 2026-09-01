import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface ReservationLookup {
  code: string;
  customerName: string;
}

/**
 * Reservation code and customer name for every occupied unit's reservation,
 * keyed by reservation id — a follow-up read, never a recomputed status.
 */
export const fetchReservationsById = async (
  supabase: SupabaseClient<Database>,
  reservationIds: string[]
): Promise<Map<string, ReservationLookup>> => {
  const reservationsById = new Map<
    string,
    ReservationLookup
  >();
  if (reservationIds.length === 0) {
    return reservationsById;
  }

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("id, code, customer_name")
    .in("id", reservationIds);
  throwIfSupabaseError(
    error,
    "categoryDetailLookups.fetchReservationsById"
  );

  for (const reservation of reservations ?? []) {
    reservationsById.set(reservation.id, {
      code: reservation.code,
      customerName: reservation.customer_name,
    });
  }
  return reservationsById;
};

/**
 * `equipment_units.current_fuel` per unit — only ever called for a
 * `consumes_fuel` category, from `unitIds` already scoped to that category.
 */
export const fetchFuelByUnitId = async (
  supabase: SupabaseClient<Database>,
  unitIds: string[]
): Promise<Map<string, number | null>> => {
  const fuelByUnitId = new Map<string, number | null>();
  if (unitIds.length === 0) {
    return fuelByUnitId;
  }

  const { data: fuelReadings, error } = await supabase
    .from("equipment_units")
    .select("id, current_fuel")
    .in("id", unitIds);
  throwIfSupabaseError(
    error,
    "categoryDetailLookups.fetchFuelByUnitId"
  );

  for (const unit of fuelReadings ?? []) {
    fuelByUnitId.set(unit.id, unit.current_fuel);
  }
  return fuelByUnitId;
};
