import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import { RESERVATION_STATUS } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

const EMPTY_QUANTITY = 0;
const NO_UNITS = 0;

interface DispatchedReservationItemRow {
  category_id: Nullable<string>;
  quantity: Nullable<number>;
}

/**
 * How many units of a by_quantity category are physically out right now —
 * "en uso ahora" for kayaks, paddleboards, and the rest of the categories
 * that have no per-unit record.
 *
 * `equipment_stock.quantity_available` never changes on dispatch or close
 * (neither `dispatchReservation` nor `closeReservation` touch it): it is the
 * total usable stock, not what is currently in the water. `category_availability`'s
 * `committed` is close but also counts `scheduled` reservations that overlap
 * the query window and have not gone out yet, which would over-count "in use".
 * Filtering `reservation_items` by `reservations.status = 'dispatched'`, with
 * no time window, mirrors exactly how `unit_current_state` decides `occupied`
 * for by_unit categories (section 7.1 of the data model design): a
 * reservation only holds `dispatched` status while its equipment is actually
 * out, so no separate "now window" is needed here either.
 */
export const sumQuantityByCategory = (
  rows: DispatchedReservationItemRow[]
): Map<string, number> => {
  const totals = new Map<string, number>();

  for (const row of rows) {
    if (!row.category_id) {
      continue;
    }
    const current =
      totals.get(row.category_id) ?? EMPTY_QUANTITY;
    totals.set(
      row.category_id,
      current + (row.quantity ?? EMPTY_QUANTITY)
    );
  }

  return totals;
};

/**
 * Reconciles a count that is meant to read "right now" against `inUse`
 * (always status-based, never a time window — see `sumQuantityByCategory`
 * above). Two screens need this:
 *
 * - The board card: `category_availability`'s `free` reasons by time window
 *   (franja). Once a `dispatched` reservation's franja passes, it stops
 *   overlapping "now" and stops being subtracted, even though the equipment
 *   is still physically out — an overdue kayak would read as free again.
 * - `QuantityTiles`' "Disponibles": without this, it showed the raw
 *   `equipment_stock.quantity_available` (the total usable count, which
 *   never changes on dispatch) next to "En uso ahora" — the same 3 kayaks
 *   counted as both available and out at once.
 *
 * `unit_current_state` never has this problem for by_unit categories: it
 * marks `occupied` for as long as the dispatch stays open, with no window at
 * all. This clamps `free` so every by_quantity read honors the same
 * invariant unit_current_state already gives by_unit categories for free: a
 * unit that is `inUse` never counts as free, overdue or not, and
 * `free + inUse` never exceeds `total`. Never touches `category_availability`
 * itself — the reservation form and franja-based availability still need it
 * to reason by window ("can I book at 3pm?"), not by current status.
 */
export const clampFreeToInUse = (
  free: number,
  inUse: number,
  total: number
): number =>
  Math.max(NO_UNITS, Math.min(free, total - inUse));

/**
 * Reads the rows `sumQuantityByCategory` needs, scoped to the requested
 * by_quantity categories. Never recomputes availability — only ever counts
 * what is already `dispatched`.
 */
export const fetchDispatchedQuantityByCategory = async (
  supabase: SupabaseClient<Database>,
  categoryIds: string[]
): Promise<Map<string, number>> => {
  if (categoryIds.length === EMPTY_QUANTITY) {
    return new Map();
  }

  const { data, error } = await supabase
    .from("reservation_items")
    .select(
      "category_id, quantity, reservation:reservations!inner(status)"
    )
    .eq("reservation.status", RESERVATION_STATUS.DISPATCHED)
    .in("category_id", categoryIds);
  throwIfSupabaseError(
    error,
    "dispatchedQuantity.fetchDispatchedQuantityByCategory"
  );

  return sumQuantityByCategory(data ?? []);
};
