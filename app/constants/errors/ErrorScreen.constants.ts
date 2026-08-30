import { MATERIAL_ICON_NAME } from "@/app/components/icons/material-icon/constants";

/**
 * Text for `app/error.tsx`, the boundary every route-level failure falls
 * into — a worker in the field, on a phone, never sees a raw exception or
 * a stack trace here. Kept generic on purpose: the real cause goes to the
 * server log through `throwIfSupabaseError`
 * (`app/utils/supabase-error/SupabaseError.ts`), never to this screen.
 */
export const ERROR_SCREEN = {
  BACK_TO_BOARD: "Volver al tablero",
  ICON: MATERIAL_ICON_NAME.ERROR,
  MESSAGE:
    "No se pudo cargar esta pantalla. No perdió ningún dato: puede intentarlo de nuevo o volver al tablero.",
  RETRY: "Reintentar",
  TITLE: "Algo salió mal",
} as const;

/**
 * Text for `app/global-error.tsx` — the last-resort boundary for a failure
 * in the root layout itself, which is rare enough that it gets its own,
 * even simpler copy rather than reusing `ERROR_SCREEN` verbatim.
 */
export const GLOBAL_ERROR_SCREEN = {
  MESSAGE:
    "La aplicación no pudo iniciar correctamente. Cierre la aplicación y vuelva a intentarlo.",
  RETRY: "Reintentar",
  TITLE: "No se pudo cargar la aplicación",
} as const;
