import { MATERIAL_ICON_NAME } from "@/app/components/icons/material-icon/constants";

/**
 * Text for `/tablero` (US-TAB-001, US-TAB-003), restyled from
 * `docs/referencia/stitch/tablero-arenal-ops--escritorio.html`: one card
 * per reservable category with how many units are free over the total.
 */
export const BOARD_SCREEN = {
  EMPTY_STATE:
    "Todavía no hay categorías reservables configuradas.",
  FREE_OF_TOTAL: (free: number, total: number): string =>
    `${free} / ${total} libres`,
  ICON: MATERIAL_ICON_NAME.DASHBOARD,
  IN_USE_NOW: (inUse: number): string =>
    `${inUse} en uso ahora`,
  SUBTITLE:
    "Qué se puede alquilar en este momento, actualizado en tiempo real.",
  TITLE: "Tablero",
} as const;
