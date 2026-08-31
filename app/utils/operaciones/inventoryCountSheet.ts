import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  CATEGORY_STATUS,
  TRACKING_MODE,
  UNIT_STATUS,
  type TrackingMode,
  type UnitStatus,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface CountSheetUnit {
  code: string;
  recordedStatus: UnitStatus;
  unitId: string;
}

export interface CountSheetCategory {
  categoryId: string;
  categoryName: string;
  quantityAvailable: number;
  quantityDamaged: number;
  quantityInRepair: number;
  trackingMode: TrackingMode;
  units: CountSheetUnit[];
}

interface CategoryQueryRow {
  id: string;
  name: string;
  tracking_mode: TrackingMode;
}

interface UnitQueryRow {
  category_id: string;
  code: string;
  id: string;
  status: UnitStatus;
}

interface StockQueryRow {
  category_id: string;
  quantity_available: number;
  quantity_damaged: number;
  quantity_in_repair: number;
}

const NO_QUANTITY = 0;

const buildCategory = (
  category: CategoryQueryRow,
  units: UnitQueryRow[],
  stock: StockQueryRow | undefined
): CountSheetCategory => ({
  categoryId: category.id,
  categoryName: category.name,
  quantityAvailable:
    stock?.quantity_available ?? NO_QUANTITY,
  quantityDamaged: stock?.quantity_damaged ?? NO_QUANTITY,
  quantityInRepair:
    stock?.quantity_in_repair ?? NO_QUANTITY,
  trackingMode: category.tracking_mode,
  units: units
    .filter((unit) => unit.category_id === category.id)
    .map((unit) => ({
      code: unit.code,
      recordedStatus: unit.status,
      unitId: unit.id,
    })),
});

/**
 * US-OPE-023: "el conteo cubre todo el inventario, categoría por
 * categoría". Three queries for the whole sheet instead of one per
 * category — this screen opens on a phone at the dock and the count is
 * taken in one sitting.
 */
export const fetchCountSheet = async (
  supabase: SupabaseClient<Database>
): Promise<CountSheetCategory[]> => {
  const [categoryResult, unitResult, stockResult] =
    await Promise.all([
      supabase
        .from("equipment_categories")
        .select("id, name, tracking_mode")
        .eq("status", CATEGORY_STATUS.ACTIVE)
        .order("name"),
      supabase
        .from("equipment_units")
        .select("id, category_id, code, status")
        .neq("status", UNIT_STATUS.DECOMMISSIONED)
        .order("code"),
      supabase
        .from("equipment_stock")
        .select(
          "category_id, quantity_available, quantity_damaged, quantity_in_repair"
        ),
    ]);
  throwIfSupabaseError(
    categoryResult.error,
    "operaciones.inventoryCountSheet.fetchCountSheet.categories"
  );
  throwIfSupabaseError(
    unitResult.error,
    "operaciones.inventoryCountSheet.fetchCountSheet.units"
  );
  throwIfSupabaseError(
    stockResult.error,
    "operaciones.inventoryCountSheet.fetchCountSheet.stock"
  );

  const units = (unitResult.data ??
    []) as unknown as UnitQueryRow[];
  const stockRows = (stockResult.data ??
    []) as unknown as StockQueryRow[];

  return (
    (categoryResult.data ??
      []) as unknown as CategoryQueryRow[]
  ).map((category) =>
    buildCategory(
      category,
      category.tracking_mode === TRACKING_MODE.BY_UNIT
        ? units
        : [],
      stockRows.find(
        (row) => row.category_id === category.id
      )
    )
  );
};
