import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type { UnitStatus } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { fetchWorkerNames } from "./workerNames";
import {
  INVENTORY_COUNT_SELECT,
  toInventoryCountSummary,
  type InventoryCountQueryRow,
  type InventoryCountSummary,
} from "./inventoryCountSummary";

export interface InventoryCountLineRow {
  systemQuantityAvailable: Nullable<number>;
  systemQuantityDamaged: Nullable<number>;
  systemQuantityInRepair: Nullable<number>;
  categoryName: string;
  confirmedStatus: Nullable<UnitStatus>;
  id: string;
  quantityAvailable: Nullable<number>;
  quantityDamaged: Nullable<number>;
  quantityInRepair: Nullable<number>;
  unitCode: Nullable<string>;
}

export interface InventoryCountDetail extends InventoryCountSummary {
  lines: InventoryCountLineRow[];
}

interface CountLineQueryRow {
  confirmed_status: Nullable<UnitStatus>;
  equipment_categories: { name: string };
  equipment_units: Nullable<{ code: string }>;
  id: string;
  quantity_available: Nullable<number>;
  system_quantity_available: Nullable<number>;
  system_quantity_damaged: Nullable<number>;
  system_quantity_in_repair: Nullable<number>;
  quantity_damaged: Nullable<number>;
  quantity_in_repair: Nullable<number>;
}

const COUNT_LINE_SELECT =
  "id, confirmed_status, quantity_available, quantity_damaged, " +
  "system_quantity_available, system_quantity_damaged, system_quantity_in_repair, " +
  "quantity_in_repair, equipment_categories!inner(name), " +
  "equipment_units(code)";

/**
 * US-OPE-024: one count, line by line, which is what makes two of them
 * comparable — "desde cuándo falta algo" is a difference between two of
 * these, not a number any single count carries on its own.
 */
export const fetchInventoryCountDetail = async (
  supabase: SupabaseClient<Database>,
  countId: string
): Promise<Nullable<InventoryCountDetail>> => {
  const [countResult, linesResult] = await Promise.all([
    supabase
      .from("inventory_counts")
      .select(INVENTORY_COUNT_SELECT)
      .eq("id", countId)
      .maybeSingle(),
    supabase
      .from("inventory_count_lines")
      .select(COUNT_LINE_SELECT)
      .eq("count_id", countId),
  ]);
  throwIfSupabaseError(
    countResult.error,
    "operaciones.inventoryCountDetail.fetchInventoryCountDetail.count"
  );
  throwIfSupabaseError(
    linesResult.error,
    "operaciones.inventoryCountDetail.fetchInventoryCountDetail.lines"
  );

  if (!countResult.data) {
    return null;
  }

  const row =
    countResult.data as unknown as InventoryCountQueryRow;
  const authorNames = await fetchWorkerNames(supabase, [
    row.created_by,
  ]);

  return {
    ...toInventoryCountSummary(row, authorNames),
    lines: (
      (linesResult.data ??
        []) as unknown as CountLineQueryRow[]
    ).map((line) => ({
      categoryName: line.equipment_categories.name,
      confirmedStatus: line.confirmed_status,
      id: line.id,
      quantityAvailable: line.quantity_available,
      systemQuantityAvailable:
        line.system_quantity_available,
      systemQuantityDamaged: line.system_quantity_damaged,
      systemQuantityInRepair:
        line.system_quantity_in_repair,
      quantityDamaged: line.quantity_damaged,
      quantityInRepair: line.quantity_in_repair,
      unitCode: line.equipment_units?.code ?? null,
    })),
  };
};
