import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  OPERATIONS_SIGNATURE,
  TRACKING_MODE,
  UNIT_STATUS,
  type TrackingMode,
  type UnitStatus,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  fetchStockDetail,
  fetchStockMovements,
  type StockDetail,
  type StockMovementRow,
} from "@/app/utils/administracion/stock";
import { fetchWorkerNames } from "./workerNames";

export interface InventoryUnitRow {
  code: string;
  id: string;
  status: UnitStatus;
}

export interface SignedStockMovement extends StockMovementRow {
  authorName: string;
}

export interface InventoryCategoryDetail {
  categoryId: string;
  categoryName: string;
  movements: SignedStockMovement[];
  stock: Nullable<StockDetail>;
  trackingMode: TrackingMode;
  units: InventoryUnitRow[];
}

/**
 * US-OPE-021: the fichas of a `by_unit` category with their code and
 * status. Decommissioned ones stay out — they are no longer part of what
 * the company has to count.
 */
const fetchCategoryUnits = async (
  supabase: SupabaseClient<Database>,
  categoryId: string
): Promise<InventoryUnitRow[]> => {
  const { data, error } = await supabase
    .from("equipment_units")
    .select("id, code, status")
    .eq("category_id", categoryId)
    .neq("status", UNIT_STATUS.DECOMMISSIONED)
    .order("code");
  throwIfSupabaseError(
    error,
    "operaciones.inventoryCategory.fetchCategoryUnits"
  );

  return (data ?? []) as InventoryUnitRow[];
};

/**
 * RNF-024: "los ajustes de inventario quedan siempre a nombre de quien los
 * hizo" (US-OPE-025). The movement already stores `created_by`; this puts
 * a readable name on it.
 */
const signMovements = async (
  supabase: SupabaseClient<Database>,
  movements: StockMovementRow[]
): Promise<SignedStockMovement[]> => {
  const authorNames = await fetchWorkerNames(
    supabase,
    movements.map((movement) => movement.createdBy)
  );

  return movements.map((movement) => ({
    ...movement,
    authorName:
      authorNames.get(movement.createdBy) ??
      OPERATIONS_SIGNATURE.UNKNOWN_AUTHOR,
  }));
};

/**
 * US-OPE-021: one category, whichever way it is tracked. A `by_unit`
 * category answers with its fichas; a `by_quantity` one answers with how
 * many there are in each state plus the movement log that says how it got
 * there.
 */
export const fetchInventoryCategoryDetail = async (
  supabase: SupabaseClient<Database>,
  categoryId: string
): Promise<Nullable<InventoryCategoryDetail>> => {
  const { data, error } = await supabase
    .from("equipment_categories")
    .select("id, name, tracking_mode")
    .eq("id", categoryId)
    .maybeSingle();
  throwIfSupabaseError(
    error,
    "operaciones.inventoryCategory.fetchInventoryCategoryDetail"
  );

  if (!data) {
    return null;
  }

  const isByUnit =
    data.tracking_mode === TRACKING_MODE.BY_UNIT;

  const [units, stock, movements] = await Promise.all([
    isByUnit
      ? fetchCategoryUnits(supabase, categoryId)
      : Promise.resolve([]),
    isByUnit
      ? Promise.resolve(null)
      : fetchStockDetail(supabase, categoryId),
    isByUnit
      ? Promise.resolve([])
      : fetchStockMovements(supabase, categoryId),
  ]);

  return {
    categoryId: data.id,
    categoryName: data.name,
    movements: await signMovements(supabase, movements),
    stock,
    trackingMode: data.tracking_mode,
    units,
  };
};
