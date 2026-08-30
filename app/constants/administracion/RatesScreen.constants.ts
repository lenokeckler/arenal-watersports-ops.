/**
 * `/administracion/tarifas` (US-ADM-024, US-ADM-025): the reference price
 * reservas charges from — per category and per type of outing (renta,
 * tour). Combos are priced on their own screen (`COMBO_FORM_SCREEN`), not
 * here — `tariffs_not_for_combo` forbids a combo tariff at the database
 * level.
 */
export const RATES_SCREEN = {
  ADD_BUTTON: "Nueva tarifa",
  COLUMN: {
    AMOUNT: "Monto",
    CATEGORY: "Categoría",
    TYPE: "Tipo de salida",
  },
  EMPTY_STATE: "No hay tarifas registradas todavía.",
  TITLE: "Tarifas",
} as const;

/**
 * `/administracion/tarifas/nueva` and `/administracion/tarifas/[tariffId]`
 * (US-ADM-024, US-ADM-025). Category and type are fixed once created —
 * `unique (category_id, type)` means changing either in place could collide
 * with another row — so editing only ever touches the amounts, the same
 * way `CategoryForm` locks `tracking_mode` once it would break something
 * else. Modifying an amount never touches `reservation_charges`: those keep
 * the amount they were charged with (US-ADM-025).
 */
export const RATE_FORM_SCREEN = {
  AMOUNT: {
    CRC_LABEL: "Monto en colones",
    HINT: "Registre el monto en la moneda en la que se cobra (US-ADM-024).",
    TITLE: "Monto",
    USD_LABEL: "Monto en dólares",
  },
  CATEGORY_LABEL: "Categoría",
  EDIT_TITLE: "Editar tarifa",
  ERROR: {
    AMOUNT_REQUIRED:
      "Registre el monto en dólares o en colones.",
    CATEGORY_TYPE_TAKEN:
      "Ya existe una tarifa para esa categoría y ese tipo de salida.",
    GENERIC: "No se pudo guardar la tarifa. Revise los datos.",
  },
  NEW_TITLE: "Nueva tarifa",
  SUBMIT: "Guardar tarifa",
  TYPE_LABEL: "Tipo de salida",
} as const;
