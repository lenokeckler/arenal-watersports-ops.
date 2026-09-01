import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  clampFreeToInUse,
  fetchDispatchedQuantityByCategory,
} from "./dispatchedQuantity";
import type { CategoryDetail } from "./categoryDetail";

interface QuantityCategoryRow {
  id: string;
  name: string;
  tracking_mode: Database["public"]["Enums"]["tracking_mode"];
}

/**
 * A by_quantity category has no per-unit record (section 4.1 of the data
 * model design): only the `equipment_stock` counts, plus how many of them
 * are dispatched right now (`inUse`, see `dispatchedQuantity.ts`).
 *
 * `Disponibles` answers "what can I hand out right now?", not "what do we
 * own?" — so unlike `/inventario` and `/operaciones/inventario` (which
 * answer "what do we have?" and rightly still count a dispatched kayak, it
 * exists and is coming back), this screen subtracts `inUse` from the usable
 * stock via `clampFreeToInUse`, the same reconciliation the board card uses.
 * `Dañados`/`En reparación` are untouched: separate `equipment_stock` pools,
 * not part of the usable count this clamps.
 */
export const fetchQuantityCategoryDetail = async (
  supabase: SupabaseClient<Database>,
  category: QuantityCategoryRow
): Promise<CategoryDetail> => {
  const [stockResult, inUseByCategory] = await Promise.all([
    supabase
      .from("equipment_stock")
      .select(
        "quantity_available, quantity_damaged, quantity_in_repair"
      )
      .eq("category_id", category.id)
      .maybeSingle(),
    fetchDispatchedQuantityByCategory(supabase, [
      category.id,
    ]),
  ]);
  throwIfSupabaseError(
    stockResult.error,
    "categoryQuantityDetail.fetchQuantityCategoryDetail"
  );

  const usable = stockResult.data?.quantity_available ?? 0;
  const inUse = inUseByCategory.get(category.id) ?? 0;

  return {
    id: category.id,
    name: category.name,
    stock: {
      available: clampFreeToInUse(usable, inUse, usable),
      damaged: stockResult.data?.quantity_damaged ?? 0,
      inRepair: stockResult.data?.quantity_in_repair ?? 0,
      inUse,
    },
    trackingMode: category.tracking_mode,
    units: null,
  };
};
