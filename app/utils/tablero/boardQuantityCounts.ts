import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  clampFreeToInUse,
  fetchDispatchedQuantityByCategory,
} from "./dispatchedQuantity";
import type { BoardCategoryCounts } from "./boardUnitCounts";

const MILLISECONDS_IN_MINUTE = 60_000;
/**
 * "Right now" is not a valid Postgres range on its own (a zero-width
 * `[now, now)` is an empty range and never overlaps anything). A one
 * minute window starting at this instant is the smallest window that
 * still catches anything active at this exact second, matching what
 * `category_availability` (section 7.2 of the data model design) expects:
 * a franja, not a point.
 */
const NOW_WINDOW_MINUTES = 1;

const nowWindow = (): {
  endsAt: string;
  startsAt: string;
} => {
  const startsAt = new Date();
  const endsAt = new Date(
    startsAt.getTime() +
      NOW_WINDOW_MINUTES * MILLISECONDS_IN_MINUTE
  );
  return {
    endsAt: endsAt.toISOString(),
    startsAt: startsAt.toISOString(),
  };
};

/**
 * Free / in-use / total for every by_quantity category. `free`/`total` come
 * from `category_availability`, then `clampFreeToInUse` (`dispatchedQuantity.ts`)
 * reconciles `free` against `inUse`, which comes from a separate, stricter
 * count — see that file for why `category_availability`'s own `committed`
 * is not reused for "in use now", and why `free` needs reconciling at all.
 */
export const fetchBoardQuantityCounts = async (
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

  const { startsAt, endsAt } = nowWindow();

  const [, inUseByCategory] = await Promise.all([
    Promise.all(
      categoryIds.map(async (categoryId) => {
        const { data: availability, error } =
          await supabase.rpc("category_availability", {
            p_category_id: categoryId,
            p_ends_at: endsAt,
            p_starts_at: startsAt,
          });
        throwIfSupabaseError(
          error,
          "boardQuantityCounts.fetchBoardQuantityCounts"
        );
        const row = availability?.[0];
        countsByCategory.set(categoryId, {
          free: Math.max(row?.free ?? 0, 0),
          inUse: 0,
          total: row?.usable ?? 0,
        });
      })
    ),
    fetchDispatchedQuantityByCategory(
      supabase,
      categoryIds
    ),
  ]);

  for (const [categoryId, inUse] of inUseByCategory) {
    const current = countsByCategory.get(categoryId);
    if (current) {
      current.inUse = inUse;
      current.free = clampFreeToInUse(
        current.free,
        inUse,
        current.total
      );
    }
  }

  return countsByCategory;
};
