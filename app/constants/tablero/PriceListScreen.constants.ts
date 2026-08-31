/**
 * Text for `/precios` (US-TAB-010): a read-only catalog of tariffs,
 * extras and combos for operations. No charges, refunds or deposits ever
 * appear here — the policies already deny operations that data, this
 * screen simply never asks for it.
 */
export const PRICE_LIST_SCREEN = {
  COMBOS_EMPTY: "No hay combos activos.",
  COMBOS_TITLE: "Combos",
  EXTRAS_EMPTY: "No hay extras activos.",
  EXTRAS_TITLE: "Extras",
  SUBTITLE:
    "Catálogo de tarifas, extras y combos. Solo lectura.",
  TARIFFS_EMPTY: "No hay tarifas activas.",
  TARIFFS_TITLE: "Tarifas por categoría",
  TITLE: "Precios",
} as const;
