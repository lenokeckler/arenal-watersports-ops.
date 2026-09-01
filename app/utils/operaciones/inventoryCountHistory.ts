import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { RETENTION } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { fetchWorkerNames } from "./workerNames";
import {
  INVENTORY_COUNT_SELECT,
  toInventoryCountSummary,
  type InventoryCountQueryRow,
  type InventoryCountSummary,
} from "./inventoryCountSummary";

/**
 * US-OPE-024: "los conteos de inventario del último año" — the same window
 * RNF-032 sets for retention, so the screen never offers a range the
 * database is allowed to have already purged.
 */
export const fetchInventoryCounts = async (
  supabase: SupabaseClient<Database>
): Promise<InventoryCountSummary[]> => {
  // `getUTC*`/`setUTC*`, not the local equivalents: this runs on the
  // server, and the local getters/setters would resolve against the
  // runtime's own zone (UTC in production) instead of a fixed instant,
  // making the window's exact boundary depend on where the code executes.
  const oldest = new Date();
  oldest.setUTCFullYear(
    oldest.getUTCFullYear() - RETENTION.COUNT_HISTORY_YEARS
  );

  const { data, error } = await supabase
    .from("inventory_counts")
    .select(INVENTORY_COUNT_SELECT)
    .gte("counted_at", oldest.toISOString())
    .order("counted_at", { ascending: false });
  throwIfSupabaseError(
    error,
    "operaciones.inventoryCountHistory.fetchInventoryCounts"
  );

  const rows = (data ??
    []) as unknown as InventoryCountQueryRow[];
  const authorNames = await fetchWorkerNames(
    supabase,
    rows.map((row) => row.created_by)
  );

  return rows.map((row) =>
    toInventoryCountSummary(row, authorNames)
  );
};
