import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  UNIT_STATUS,
  type TrackingMode,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface ReservableCategory {
  id: string;
  name: string;
  trackingMode: TrackingMode;
}

export interface CandidateUnit {
  categoryId: string;
  code: string;
  id: string;
}

/**
 * US-RES-007: every reservable category, regardless of how it is tracked —
 * the form decides whether to ask for a quantity or for specific units.
 */
export const fetchReservableCategories = async (
  supabase: SupabaseClient<Database>
): Promise<ReservableCategory[]> => {
  const { data, error } = await supabase
    .from("equipment_categories")
    .select("id, name, tracking_mode")
    .eq("is_reservable", true)
    .eq("status", "active")
    .order("name");
  throwIfSupabaseError(
    error,
    "reservas.newReservationData.fetchReservableCategories"
  );

  return (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    trackingMode: category.tracking_mode,
  }));
};

/**
 * US-RES-017: the hard filter — a unit in maintenance, damaged, in repair
 * or decommissioned never even reaches the candidate list. Whether a
 * candidate collides with a *future* reservation is a separate, franja-
 * dependent question `unit_conflicts` answers as a warning, not a filter.
 */
export const fetchCandidateUnits = async (
  supabase: SupabaseClient<Database>,
  categoryIds: string[]
): Promise<CandidateUnit[]> => {
  if (categoryIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("equipment_units")
    .select("id, code, category_id")
    .in("category_id", categoryIds)
    .eq("status", UNIT_STATUS.AVAILABLE)
    .order("code");
  throwIfSupabaseError(
    error,
    "reservas.newReservationData.fetchCandidateUnits"
  );

  return (data ?? []).map((unit) => ({
    categoryId: unit.category_id,
    code: unit.code,
    id: unit.id,
  }));
};
