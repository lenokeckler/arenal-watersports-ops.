import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface CategoryAvailability {
  committed: number;
  free: number;
  usable: number;
}

/**
 * US-RES-015: never recomputed here — `category_availability` is the
 * single place that resolves the semiopen `[)` overlap and the case of a
 * category with no `equipment_stock` row yet.
 */
export const fetchCategoryAvailability = async (
  supabase: SupabaseClient<Database>,
  categoryId: string,
  startsAt: string,
  endsAt: string
): Promise<CategoryAvailability> => {
  const { data, error } = await supabase.rpc(
    "category_availability",
    {
      p_category_id: categoryId,
      p_ends_at: endsAt,
      p_starts_at: startsAt,
    }
  );
  throwIfSupabaseError(
    error,
    "reservas.availabilityQueries.fetchCategoryAvailability"
  );

  const row = data?.[0];
  return {
    committed: row?.committed ?? 0,
    free: row?.free ?? 0,
    usable: row?.usable ?? 0,
  };
};

export interface UnitConflict {
  code: string;
  endsAt: string;
  reservationId: string;
  startsAt: string;
}

/**
 * US-RES-016: informs, never blocks — `unit_conflicts` names exactly which
 * reservation the chosen unit would collide with over this franja.
 */
export const fetchUnitConflicts = async (
  supabase: SupabaseClient<Database>,
  unitId: string,
  startsAt: string,
  endsAt: string
): Promise<UnitConflict[]> => {
  const { data, error } = await supabase.rpc(
    "unit_conflicts",
    {
      p_ends_at: endsAt,
      p_starts_at: startsAt,
      p_unit_id: unitId,
    }
  );
  throwIfSupabaseError(
    error,
    "reservas.availabilityQueries.fetchUnitConflicts"
  );

  return (data ?? []).map((row) => ({
    code: row.code,
    endsAt: row.ends_at,
    reservationId: row.reservation_id,
    startsAt: row.starts_at,
  }));
};
