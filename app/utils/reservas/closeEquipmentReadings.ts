import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface UnitClosingReading {
  fuelLevel: Nullable<number>;
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
      fuel_in: reading.fuelLevel,
      updated_by: workerId,
      usage_in: reading.usageReading,
    })
    .eq("id", reading.itemId);
  throwIfSupabaseError(
    error,
    "reservas.closeEquipmentReadings.closeReservationItem"
  );
};

const closeEquipmentUnit = async (
  supabase: SupabaseClient<Database>,
  reading: UnitClosingReading,
  workerId: string
): Promise<void> => {
  const patch: {
    fuel_level?: number;
    updated_by: string;
    usage_total?: number;
  } = { updated_by: workerId };
  if (reading.fuelLevel !== null) {
    patch.fuel_level = reading.fuelLevel;
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
    "reservas.closeEquipmentReadings.closeEquipmentUnit"
  );
};

/**
 * Writes back what a unit's tank and engine looked like the moment it
 * stopped moving: mirrors the reading onto the `reservation_items` row that
 * asked for it and onto the `equipment_units` row that owns the machine.
 * `equipment_units.usage_total` is the accumulated reading operaciones
 * maintains (US-ADM-028 reads it later) — this overwrites it with the
 * latest instrument reading, it never adds a delta.
 *
 * One path, two callers: reservas closes the equipment of a dispatched
 * reservation it postpones for weather (US-RES-020), and operaciones closes
 * it for real when the reservation itself comes back (US-OPE-009).
 */
export const applyEquipmentClosingReadings = async (
  supabase: SupabaseClient<Database>,
  closings: UnitClosingReading[],
  workerId: string
): Promise<void> => {
  await Promise.all(
    closings.flatMap((reading) => [
      closeReservationItem(supabase, reading, workerId),
      closeEquipmentUnit(supabase, reading, workerId),
    ])
  );
};
