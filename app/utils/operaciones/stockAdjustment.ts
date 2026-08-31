import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import type { StockQuantities } from "@/app/utils/administracion/stockValidation";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface StockAdjustment {
  categoryId: string;
  next: StockQuantities;
  previous: StockQuantities;
  reason: string;
  workerId: string;
}

const writeQuantities = async (
  supabase: SupabaseClient<Database>,
  adjustment: StockAdjustment
): Promise<void> => {
  const { error } = await supabase
    .from("equipment_stock")
    .update({
      quantity_available: adjustment.next.quantityAvailable,
      quantity_damaged: adjustment.next.quantityDamaged,
      quantity_in_repair: adjustment.next.quantityInRepair,
      updated_by: adjustment.workerId,
    })
    .eq("category_id", adjustment.categoryId);
  throwIfSupabaseError(
    error,
    "operaciones.stockAdjustment.writeQuantities"
  );
};

const logMovement = async (
  supabase: SupabaseClient<Database>,
  adjustment: StockAdjustment
): Promise<void> => {
  const { error } = await supabase
    .from("equipment_stock_movements")
    .insert({
      category_id: adjustment.categoryId,
      created_by: adjustment.workerId,
      from_available: adjustment.previous.quantityAvailable,
      from_damaged: adjustment.previous.quantityDamaged,
      from_in_repair: adjustment.previous.quantityInRepair,
      reason: adjustment.reason,
      to_available: adjustment.next.quantityAvailable,
      to_damaged: adjustment.next.quantityDamaged,
      to_in_repair: adjustment.next.quantityInRepair,
    });
  throwIfSupabaseError(
    error,
    "operaciones.stockAdjustment.logMovement"
  );
};

/**
 * US-OPE-022 and US-OPE-025 for a `by_quantity` category: "un chaleco roto
 * sigue sumando como chaleco si solo se mira el número" — moving one from
 * available to damaged is what makes the count say how many actually work.
 * `category_availability` only counts `quantity_available`, so the board
 * stops offering the broken one the moment this lands.
 *
 * The movement is not optional bookkeeping: it is the whole of US-OPE-025,
 * since a category by quantity has no ficha to carry its own history. Same
 * order as the administración path (US-ADM-017): quantities first, log
 * second, and a failure in either one surfaces to the caller rather than
 * being swallowed.
 */
export const applyStockAdjustment = async (
  supabase: SupabaseClient<Database>,
  adjustment: StockAdjustment
): Promise<void> => {
  await writeQuantities(supabase, adjustment);
  await logMovement(supabase, adjustment);
};
