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
  EMPTY_UNITS: "Esta categoría todavía no tiene unidades registradas.",
  IN_REPAIR: "En reparación",
  NOT_FOUND: "Esta categoría no existe o no es reservable.",
  QUANTITY_AVAILABLE: "Disponibles",
  RESERVATION_LINK: "Ver reserva",
  RETURNS_AT: "Regresa a las",
  TOTAL: "Total",
  UNIT_CODE: "Código",
} as const;
