import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { EQUIPMENT_UNIT_STATUS } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface BoardCategoryCounts {
  free: number;
  inUse: number;
  total: number;
}

const DECOMMISSIONED = "decommissioned";
const AVAILABLE_EFFECTIVE_STATUS = "available";

/**
 * Free / in-use / total for every by_unit category, read straight off
 * `unit_current_state` — it already resolves `occupied`, no recomputation.
 */
export const fetchBoardUnitCounts = async (
  supabase: SupabaseClient<Database>,
  categoryIds: string[]
): Promise<Map<string, BoardCategoryCounts>> => {
  const countsByCategory = new Map<
    string,
    BoardCategoryCounts
  >();
  if (categoryIds.length === 0) {
    return countsByCategory;
  }

  const { data: units, error } = await supabase
    .from("unit_current_state")
    .select(
      "category_id, effective_status, recorded_status"
    )
    .in("category_id", categoryIds)
    .neq("recorded_status", DECOMMISSIONED);
  throwIfSupabaseError(
    error,
    "boardUnitCounts.fetchBoardUnitCounts"
  );

  for (const unit of units ?? []) {
    if (!unit.category_id) {
      continue;
    }
    const current = countsByCategory.get(
      unit.category_id
    ) ?? {
      free: 0,
      inUse: 0,
      total: 0,
    };
    current.total += 1;
    if (
      unit.effective_status === AVAILABLE_EFFECTIVE_STATUS
    ) {
      current.free += 1;
    }
    if (
      unit.effective_status ===
      EQUIPMENT_UNIT_STATUS.OCCUPIED
    ) {
      current.inUse += 1;
    }
    countsByCategory.set(unit.category_id, current);
  }

  return countsByCategory;
};
