/**
 * Shared by every screen that shows a per-currency amount through
 * `PriceAmounts` — `/precios` and the administración catalogs it mirrors
 * (extras, combos, tarifas) — never a single "totaled" figure, since the
 * system does not manage an exchange rate (US-TAB-010, US-ADM-026).
 */
export const MONEY_LABEL = {
  /**
   * Ninguno de los pares de moneda de la aplicacion exige las dos: las
   * tarifas piden al menos una, y los precios de combos, extras y depositos
   * admiten ninguna. `FormField` pone el asterisco de obligatorio por
   * omision, asi que los cuatro formularios lo decian mal.
   */
  CURRENCY_PAIR_HINT:
    "Puede registrar una sola moneda; los montos nunca se convierten entre sí.",
  NO_PRICE: "Sin precio",
} as const;
