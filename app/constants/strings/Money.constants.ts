/**
 * Shared by every screen that shows a per-currency amount through
 * `PriceAmounts` — `/precios` and the administración catalogs it mirrors
 * (extras, combos, tarifas) — never a single "totaled" figure, since the
 * system does not manage an exchange rate (US-TAB-010, US-ADM-026).
 */
export const MONEY_LABEL = {
  NO_PRICE: "Sin precio",
} as const;
