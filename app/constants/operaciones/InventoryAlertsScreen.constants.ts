/**
 * `/operaciones/avisos` (US-OPE-026, US-OPE-027). Both lists only ever
 * show what administración configured on the category itself: no minimum
 * means no quantity alert, no anticipation means no expiry alert.
 */
export const INVENTORY_ALERTS_SCREEN = {
  EXPIRY: {
    EMPTY: "Nada se acerca a su fecha de vencimiento.",
    EXPIRED: (days: number): string =>
      days === 1
        ? "Venció hace 1 día"
        : `Venció hace ${days} días`,
    REMAINING: (days: number): string =>
      days === 1
        ? "Vence en 1 día"
        : `Vence en ${days} días`,
    TITLE: "Vencimientos",
    TODAY: "Vence hoy",
  },
  QUANTITY: {
    CURRENT: (available: number, minimum: number): string =>
      `Hay ${available} · mínimo ${minimum}`,
    EMPTY: "Ningún artículo bajó de su cantidad mínima.",
    MISSING: (missing: number): string =>
      missing === 1
        ? "Falta 1 para el mínimo"
        : `Faltan ${missing} para el mínimo`,
    TITLE: "Cantidad mínima",
  },
  SUBTITLE:
    "Lo que hay que reponer antes de que haga falta.",
  TITLE: "Avisos del inventario",
} as const;
