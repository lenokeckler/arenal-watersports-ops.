import type { Nullable } from "@/app/types";
import { OPERATIONS_SIGNATURE } from "@/app/constants";

export interface InventoryCountSummary {
  authorName: string;
  countedAt: string;
  id: string;
  linesCount: number;
  notes: Nullable<string>;
}

export interface InventoryCountQueryRow {
  counted_at: string;
  created_by: string;
  id: string;
  inventory_count_lines: { count: number }[];
  notes: Nullable<string>;
}

export const INVENTORY_COUNT_SELECT =
  "id, counted_at, notes, created_by, inventory_count_lines(count)";

const FIRST_GROUP = 0;
const NO_LINES = 0;

/**
 * US-OPE-024: "cada conteo guarda su fecha y el nombre de quien lo
 * levantó". Shared by the history list and the detail of a single count so
 * both show the same signature the same way.
 */
export const toInventoryCountSummary = (
  row: InventoryCountQueryRow,
  authorNames: Map<string, string>
): InventoryCountSummary => ({
  authorName:
    authorNames.get(row.created_by) ??
    OPERATIONS_SIGNATURE.UNKNOWN_AUTHOR,
  countedAt: row.counted_at,
  id: row.id,
  linesCount:
    row.inventory_count_lines[FIRST_GROUP]?.count ??
    NO_LINES,
  notes: row.notes,
});
