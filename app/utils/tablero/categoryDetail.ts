import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  TRACKING_MODE,
  type EquipmentImageTreatment,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { fetchQuantityCategoryDetail } from "./categoryQuantityDetail";
import { fetchUnitCategoryDetail } from "./categoryUnitDetail";

export interface CategoryDetailUnit {
  code: string;
  customerName: Nullable<string>;
  effectiveStatus: string;
  /** Current fuel line, 0..fuelMax. Only populated for `consumes_fuel` categories. */
  fuelLevel: Nullable<number>;
  /** How many lines the gauge has. Only populated for `consumes_fuel` categories. */
  fuelMax: Nullable<number>;
  id: string;
  imageAlt: string;
  imageSrc: Nullable<string>;
  /** Contained cutout vs. bled photo — `null` when there is no image at all. */
  imageTreatment: Nullable<EquipmentImageTreatment>;
  reservationCode: Nullable<string>;
  reservationId: Nullable<string>;
  returnsAt: Nullable<string>;
}

export interface CategoryDetailStock {
  available: number;
  damaged: number;
  inRepair: number;
  /** How many units are physically out right now — see `dispatchedQuantity.ts`. */
  inUse: number;
}

export interface CategoryDetail {
  id: string;
  name: string;
  stock: Nullable<CategoryDetailStock>;
  trackingMode: (typeof TRACKING_MODE)[keyof typeof TRACKING_MODE];
  units: Nullable<CategoryDetailUnit[]>;
}

/**
 * US-TAB-002: opening a category shows the state of what is inside. A
 * by_quantity category delegates to `categoryQuantityDetail.ts`, a by_unit
 * category to `categoryUnitDetail.ts` — this only resolves the category and
 * which of the two applies.
 */
export const fetchCategoryDetail = async (
  supabase: SupabaseClient<Database>,
  categoryId: string
): Promise<Nullable<CategoryDetail>> => {
  const { data: category, error: categoryError } =
    await supabase
      .from("equipment_categories")
      .select(
        "id, name, tracking_mode, is_reservable, consumes_fuel"
      )
      .eq("id", categoryId)
      .maybeSingle();
  throwIfSupabaseError(
    categoryError,
    "categoryDetail.fetchCategoryDetail.category"
  );

  if (!category || !category.is_reservable) {
    return null;
  }

  return category.tracking_mode ===
    TRACKING_MODE.BY_QUANTITY
    ? fetchQuantityCategoryDetail(supabase, category)
    : fetchUnitCategoryDetail(supabase, category);
};
