import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { TRACKING_MODE } from "@/app/constants";
import { resolveEquipmentImage } from "./equipmentImage";

export interface BoardCategory {
  free: number;
  id: string;
  imageAlt: string;
  imageSrc: string | null;
  name: string;
  total: number;
  trackingMode: (typeof TRACKING_MODE)[keyof typeof TRACKING_MODE];
}

const DECOMMISSIONED = "decommissioned";
const AVAILABLE_EFFECTIVE_STATUS = "available";
/**
 * "Right now" is not a valid Postgres range on its own (a zero-width
 * `[now, now)` is an empty range and never overlaps anything). A one
 * minute window starting at this instant is the smallest window that
 * still catches anything active at this exact second, matching what
 * `category_availability` (section 7.2 of the data model design) expects:
 * a franja, not a point.
 */
const NOW_WINDOW_MINUTES = 1;

const nowWindow = (): { endsAt: string; startsAt: string } => {
  const startsAt = new Date();
  const endsAt = new Date(
    startsAt.getTime() + NOW_WINDOW_MINUTES * 60_000
  );
  return { endsAt: endsAt.toISOString(), startsAt: startsAt.toISOString() };
};

/**
 * US-TAB-001/002/003: one card per reservable category with how many
 * units are free over the total. By_unit categories read straight off
 * `unit_current_state` (already resolves `occupied`); by_quantity
 * categories call `category_availability`, never recomputed here.
 */
export const fetchBoardCategories = async (
  supabase: SupabaseClient<Database>
): Promise<BoardCategory[]> => {
  const { data: categories } = await supabase
    .from("equipment_categories")
    .select("id, name, tracking_mode")
    .eq("is_reservable", true)
    .eq("status", "active")
    .order("name");

  if (!categories || categories.length === 0) {
    return [];
  }

  const byUnitIds = categories
    .filter((category) => category.tracking_mode === TRACKING_MODE.BY_UNIT)
    .map((category) => category.id);

  const unitCountsByCategory = new Map<
    string,
    { free: number; total: number }
  >();

  if (byUnitIds.length > 0) {
    const { data: units } = await supabase
      .from("unit_current_state")
      .select("category_id, effective_status, recorded_status")
      .in("category_id", byUnitIds)
      .neq("recorded_status", DECOMMISSIONED);

    for (const unit of units ?? []) {
      if (!unit.category_id) {
        continue;
      }
      const current = unitCountsByCategory.get(unit.category_id) ?? {
        free: 0,
        total: 0,
      };
      current.total += 1;
      if (unit.effective_status === AVAILABLE_EFFECTIVE_STATUS) {
        current.free += 1;
      }
      unitCountsByCategory.set(unit.category_id, current);
    }
  }

  const { startsAt, endsAt } = nowWindow();

  const byQuantityCategories = categories.filter(
    (category) => category.tracking_mode === TRACKING_MODE.BY_QUANTITY
  );

  const quantityCountsByCategory = new Map<
    string,
    { free: number; total: number }
  >();

  await Promise.all(
    byQuantityCategories.map(async (category) => {
      const { data: availability } = await supabase.rpc(
        "category_availability",
        {
          p_category_id: category.id,
          p_ends_at: endsAt,
          p_starts_at: startsAt,
        }
      );
      const row = availability?.[0];
      quantityCountsByCategory.set(category.id, {
        free: Math.max(row?.free ?? 0, 0),
        total: row?.usable ?? 0,
      });
    })
  );

  return categories.map((category) => {
    const counts =
      category.tracking_mode === TRACKING_MODE.BY_UNIT
        ? unitCountsByCategory.get(category.id)
        : quantityCountsByCategory.get(category.id);
    const image = resolveEquipmentImage(category.name);

    return {
      free: counts?.free ?? 0,
      id: category.id,
      imageAlt: image?.alt ?? category.name,
      imageSrc: image?.src ?? null,
      name: category.name,
      total: counts?.total ?? 0,
      trackingMode: category.tracking_mode,
    };
  });
};
