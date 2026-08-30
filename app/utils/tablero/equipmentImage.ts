import {
  CATEGORY_IMAGE_BY_NAME,
  UNIT_IMAGE_BY_CODE,
} from "@/app/constants";
import type { Nullable } from "@/app/types";

interface EquipmentImage {
  alt: string;
  src: string;
}

/**
 * A unit's own photo (e.g. `PONTOON` vs `BENNINGTON`, two very different
 * boats under the same `Lancha` category) wins over its category's photo.
 * Returns `null` when neither exists — the caller falls back to
 * `DEFAULT_CATEGORY_ICON` instead of a broken image.
 */
export const resolveEquipmentImage = (
  categoryName: string,
  unitCode?: string
): Nullable<EquipmentImage> =>
  (unitCode && UNIT_IMAGE_BY_CODE[unitCode]) ||
  CATEGORY_IMAGE_BY_NAME[categoryName] ||
  null;
