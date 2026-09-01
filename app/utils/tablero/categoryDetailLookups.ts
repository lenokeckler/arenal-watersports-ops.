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

/** `equipment_units.fuel_level`/`fuel_max` for one unit. */
export interface UnitFuelReading {
  fuelLevel: number | null;
  fuelMax: number;
}

/**
 * `equipment_units.fuel_level`/`fuel_max` per unit — only ever called for a
 * `consumes_fuel` category, from `unitIds` already scoped to that category.
 */
export const fetchFuelByUnitId = async (
  supabase: SupabaseClient<Database>,
  unitIds: string[]
): Promise<Map<string, UnitFuelReading>> => {
  const fuelByUnitId = new Map<string, UnitFuelReading>();
  if (unitIds.length === 0) {
    return fuelByUnitId;
  }

  const { data: fuelReadings, error } = await supabase
    .from("equipment_units")
    .select("id, fuel_level, fuel_max")
    .in("id", unitIds);
  throwIfSupabaseError(
    error,
    "categoryDetailLookups.fetchFuelByUnitId"
  );

  for (const unit of fuelReadings ?? []) {
    fuelByUnitId.set(unit.id, {
      fuelLevel: unit.fuel_level,
      fuelMax: unit.fuel_max,
    });
  }
  return fuelByUnitId;
};

/** `equipment_units.usage_total` for one unit. */
export interface UnitUsageReading {
  usageTotal: number;
}

/**
 * `equipment_units.usage_total` per unit — only ever called for a
 * `has_motor` category, from `unitIds` already scoped to that category.
 */
export const fetchUsageByUnitId = async (
  supabase: SupabaseClient<Database>,
  unitIds: string[]
): Promise<Map<string, UnitUsageReading>> => {
  const usageByUnitId = new Map<string, UnitUsageReading>();
  if (unitIds.length === 0) {
    return usageByUnitId;
  }

  const { data: usageReadings, error } = await supabase
    .from("equipment_units")
    .select("id, usage_total")
    .in("id", unitIds);
  throwIfSupabaseError(
    error,
    "categoryDetailLookups.fetchUsageByUnitId"
  );

  for (const unit of usageReadings ?? []) {
    usageByUnitId.set(unit.id, {
      usageTotal: unit.usage_total,
    });
  }
  return usageByUnitId;
};
