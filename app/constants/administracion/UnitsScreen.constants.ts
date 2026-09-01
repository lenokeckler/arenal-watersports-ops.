/**
 * `/administracion/unidades` (EP-ADM-03): a hub over every active category
 * that routes into the right screen for its modality — a unit ficha list
 * for `by_unit`, the single stock row for `by_quantity`.
 */
export const UNITS_HUB_SCREEN = {
  COLUMN: {
    NAME: "Categoría",
    TRACKING_MODE: "Modalidad",
  },
  EMPTY_STATE: "No hay categorías activas todavía.",
  MANAGE_LINK: "Gestionar",
  TITLE: "Unidades y artículos",
} as const;

/**
 * `/administracion/unidades/[categoryId]` when the category is `by_unit`
 * (US-ADM-016): the ficha list, one row per unit that has not been
 * decommissioned.
 */
export const UNIT_LIST_SCREEN = {
  ADD_BUTTON: "Nueva unidad",
  COLUMN: {
    CODE: "Código",
    FUEL_LEVEL: "Gasolina",
    NEXT_OIL_CHANGE: "Próximo cambio de aceite",
    STATUS: "Estado",
    USAGE_TOTAL: "Uso acumulado",
  },
  EMPTY_STATE:
    "Esta categoría todavía no tiene unidades registradas.",
} as const;
