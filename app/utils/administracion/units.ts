import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  CATEGORY_STATUS,
  UNIT_STATUS,
  type TrackingMode,
  type UnitStatus,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface InventoryCategoryRow {
  id: string;
  name: string;
  trackingMode: TrackingMode;
}

export interface UnitListRow {
  code: string;
  fuelLevel: Nullable<number>;
  fuelMax: number;
  id: string;
  nextOilChangeAt: Nullable<number>;
  status: UnitStatus;
  usageTotal: number;
}

export interface UnitDetail extends UnitListRow {
  categoryId: string;
  decommissionReason: Nullable<string>;
  decommissionedAt: Nullable<string>;
}

interface InventoryCategoryQueryRow {
  id: string;
  name: string;
  tracking_mode: TrackingMode;
}

interface UnitListQueryRow {
  code: string;
  fuel_level: Nullable<number>;
  fuel_max: number;
  id: string;
  next_oil_change_at: Nullable<number>;
  status: UnitStatus;
  usage_total: number;
}

interface UnitDetailQueryRow extends UnitListQueryRow {
  category_id: string;
  decommission_reason: Nullable<string>;
  decommissioned_at: Nullable<string>;
}

const toUnitListRow = (
  row: UnitListQueryRow
): UnitListRow => ({
  code: row.code,
  fuelLevel: row.fuel_level,
  fuelMax: row.fuel_max,
  id: row.id,
  nextOilChangeAt: row.next_oil_change_at,
  status: row.status,
  usageTotal: row.usage_total,
});

const toUnitDetail = (
  row: UnitDetailQueryRow
): UnitDetail => ({
  ...toUnitListRow(row),
  categoryId: row.category_id,
  decommissionReason: row.decommission_reason,
  decommissionedAt: row.decommissioned_at,
});

/**
 * `/administracion/unidades` (EP-ADM-03): every active category, so
 * administración can reach the right inventory screen — a unit ficha list
 * or the single stock row — without guessing the modality first.
 */
export const fetchInventoryCategories = async (
  supabase: SupabaseClient<Database>
): Promise<InventoryCategoryRow[]> => {
  const { data, error } = await supabase
    .from("equipment_categories")
    .select("id, name, tracking_mode")
    .eq("status", CATEGORY_STATUS.ACTIVE)
    .order("name");
  throwIfSupabaseError(
    error,
    "units.fetchInventoryCategories"
  );

  return (
    (data ?? []) as unknown as InventoryCategoryQueryRow[]
  ).map((row) => ({
    id: row.id,
    name: row.name,
    trackingMode: row.tracking_mode,
  }));
};

/**
 * US-ADM-016: the fichas of a `by_unit` category. Decommissioned units are
 * excluded — US-ADM-018 says a decommissioned unit "deja de existir" for
 * day-to-day operation, and this listing is exactly that.
 */
export const fetchUnitsForCategory = async (
  supabase: SupabaseClient<Database>,
  categoryId: string
): Promise<UnitListRow[]> => {
  const { data, error } = await supabase
    .from("equipment_units")
    .select(
      "id, code, status, fuel_level, fuel_max, usage_total, next_oil_change_at"
    )
    .eq("category_id", categoryId)
    .neq("status", UNIT_STATUS.DECOMMISSIONED)
    .order("code");
  throwIfSupabaseError(
    error,
    "units.fetchUnitsForCategory"
  );

  return (
    (data ?? []) as unknown as UnitListQueryRow[]
  ).map(toUnitListRow);
};

export const fetchUnitDetail = async (
  supabase: SupabaseClient<Database>,
  unitId: string
): Promise<Nullable<UnitDetail>> => {
  const { data, error } = await supabase
    .from("equipment_units")
    .select(
      "id, category_id, code, status, fuel_level, fuel_max, usage_total, " +
        "next_oil_change_at, decommissioned_at, decommission_reason"
    )
    .eq("id", unitId)
    .maybeSingle();
  throwIfSupabaseError(error, "units.fetchUnitDetail");

  return data
    ? toUnitDetail(data as unknown as UnitDetailQueryRow)
    : null;
};
