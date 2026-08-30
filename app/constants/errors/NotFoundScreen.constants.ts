import { MATERIAL_ICON_NAME } from "@/app/components/icons/material-icon/constants";

/**
 * Text for `app/not-found.tsx` — a mistyped or stale link (US-TAB-005 style
 * navigation, a bookmarked URL, a bad deep link), never a server failure.
 */
export const NOT_FOUND_SCREEN = {
  BACK_TO_BOARD: "Volver al tablero",
  ICON: MATERIAL_ICON_NAME.SEARCH_OFF,
  MESSAGE:
    "La página que busca no existe o cambió de dirección.",
  TITLE: "No encontramos esta página",
} as const;
