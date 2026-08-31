import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  OPERATIONS_ERROR,
  type UnitStatus,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/**
 * One line of a count. `count_line_is_one_shape` in the schema forces the
 * two halves apart: a `by_unit` line confirms one ficha's status, a
 * `by_quantity` line records three numbers. Never both.
 */
export interface InventoryCountLine {
  categoryId: string;
  confirmedStatus: Nullable<UnitStatus>;
  quantityAvailable: Nullable<number>;
  quantityDamaged: Nullable<number>;
  quantityInRepair: Nullable<number>;
  unitId: Nullable<string>;
}

export interface InventoryCountInput {
  lines: InventoryCountLine[];
  notes: Nullable<string>;
  workerId: string;
}

/**
 * US-OPE-023: "operaciones escoge cuándo hacerlo" — there is no schedule
 * and no trigger, the count exists because somebody closed one. Header
 * first, then its lines: a count with no lines is a count that was started
 * and abandoned, which is still truer than lines belonging to nothing.
 * US-OPE-024's history reads `counted_at` and `created_by` off this header.
 */
export const createInventoryCount = async (
  supabase: SupabaseClient<Database>,
  input: InventoryCountInput
): Promise<string> => {
  const { data, error } = await supabase
    .from("inventory_counts")
    .insert({
      created_by: input.workerId,
      notes: input.notes,
    })
    .select("id")
    .single();
  throwIfSupabaseError(
    error,
    "operaciones.createInventoryCount.insertCount"
  );

  if (!data) {
    throw new Error(OPERATIONS_ERROR.COUNT_HEADER_MISSING);
  }

  const countId = data.id;

  const { error: linesError } = await supabase
    .from("inventory_count_lines")
    .insert(
      input.lines.map((line) => ({
        category_id: line.categoryId,
        confirmed_status: line.confirmedStatus,
        count_id: countId,
        quantity_available: line.quantityAvailable,
        quantity_damaged: line.quantityDamaged,
        quantity_in_repair: line.quantityInRepair,
        unit_id: line.unitId,
      }))
    );
  throwIfSupabaseError(
    linesError,
    "operaciones.createInventoryCount.insertLines"
  );

  return countId;
};
