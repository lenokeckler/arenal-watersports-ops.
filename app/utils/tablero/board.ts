import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  TRACKING_MODE,
  type EquipmentImageTreatment,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { resolveEquipmentImage } from "./equipmentImage";
import { groupBoardCards } from "./boardCardGrouping";
import { fetchBoardUnitCounts } from "./boardUnitCounts";
import { fetchBoardQuantityCounts } from "./boardQuantityCounts";

export interface BoardCategory {
  free: number;
  /**
   * Cuando varias categorias comparten grupo, el tablero muestra una sola
   * tarjeta con el nombre del grupo y la suma de las dos. `id` es entonces
   * el de la primera del grupo, que es a donde lleva la tarjeta.
   */
  groupName: string | null;
  id: string;
  imageAlt: string;
  imageSrc: string | null;
  /** Contained cutout vs. bled photo — `null` when there is no image at all. */
  imageTreatment: EquipmentImageTreatment | null;
  /** How many units are physically out right now — never derived from `free`. */
  inUse: number;
  name: string;
  total: number;
  trackingMode: (typeof TRACKING_MODE)[keyof typeof TRACKING_MODE];
}

/**
 * US-TAB-001/002/003: one card per reservable category with how many units
 * are free over the total, and how many are out right now. By_unit counts
 * come from `boardUnitCounts.ts`, by_quantity counts from
 * `boardQuantityCounts.ts` — this only orchestrates the two and shapes the
 * result into `BoardCategory`.
 */
export const fetchBoardCategories = async (
  supabase: SupabaseClient<Database>
): Promise<BoardCategory[]> => {
  const { data: categories, error: categoriesError } =
    await supabase
      .from("equipment_categories")
      .select("id, name, tracking_mode, group_name")
      .eq("is_reservable", true)
      .eq("status", "active")
      .order("name");
  throwIfSupabaseError(
    categoriesError,
    "board.fetchBoardCategories.categories"
  );

  if (!categories || categories.length === 0) {
    return [];
  }

  const byUnitIds = categories
    .filter(
      (category) =>
        category.tracking_mode === TRACKING_MODE.BY_UNIT
    )
    .map((category) => category.id);
  const byQuantityIds = categories
    .filter(
      (category) =>
        category.tracking_mode === TRACKING_MODE.BY_QUANTITY
    )
    .map((category) => category.id);

  const [unitCounts, quantityCounts] = await Promise.all([
    fetchBoardUnitCounts(supabase, byUnitIds),
    fetchBoardQuantityCounts(supabase, byQuantityIds),
  ]);

  const cards = categories.map((category) => {
    const counts =
      category.tracking_mode === TRACKING_MODE.BY_UNIT
        ? unitCounts.get(category.id)
        : quantityCounts.get(category.id);
    const image = resolveEquipmentImage(category.name);

    return {
      free: counts?.free ?? 0,
      groupName: category.group_name,
      id: category.id,
      imageAlt: image?.alt ?? category.name,
      imageSrc: image?.src ?? null,
      imageTreatment: image?.treatment ?? null,
      inUse: counts?.inUse ?? 0,
      name: category.name,
      total: counts?.total ?? 0,
      trackingMode: category.tracking_mode,
    };
  });

  return groupBoardCards(cards);
};
