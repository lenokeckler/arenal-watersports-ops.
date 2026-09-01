/**
 * Text for `/tablero/categoria/[categoryId]` (US-TAB-002), restyled from
 * `docs/referencia/stitch/gestion-de-jet-ski--escritorio.html` (by_unit)
 * and adapted for by_quantity categories, which have no per-unit record
 * to list (section 4.1 of the data model design) — only counts.
 */
export const CATEGORY_DETAIL_SCREEN = {
  BACK_TO_BOARD: "Volver al tablero",
  CARRIED_BY: "Lleva",
  DAMAGED: "Dañados",
  EMPTY_UNITS:
    "Esta categoría todavía no tiene unidades registradas.",
  FREE_IN_MINUTES: (minutes: number): string =>
    `Libre en ${minutes} min`,
  FUEL_LABEL: "Combustible",
  FUEL_LEVEL: (level: number, max: number): string =>
    `${level}/${max}`,
  IN_REPAIR: "En reparación",
  IN_USE_NOW: "En uso ahora",
  NOT_FOUND: "Esta categoría no existe o no es reservable.",
  OVERDUE_BADGE: "Vencida",
  OVERDUE_BY_MINUTES: (minutes: number): string =>
    `${minutes} min de retraso`,
  QUANTITY_AVAILABLE: "Disponibles",
  RESERVATION_LINK: "Ver reserva",
  RETURNS_AT: "Regresa a las",
  TOTAL: "Total",
  UNIT_CODE: "Código",
} as const;
