/**
 * Text for `/tablero/categoria/[categoryId]` (US-TAB-002), restyled from
 * `docs/referencia/stitch/gestion-de-jet-ski--escritorio.html` (by_unit)
 * and adapted for by_quantity categories, which have no per-unit record
 * to list (section 4.1 of the data model design) — only counts.
 */
export const CATEGORY_DETAIL_SCREEN = {
  BACK_TO_BOARD: "Volver al tablero",
  CANCEL_SELECTION: "Cancelar",
  CARRIED_BY: "Lleva",
  DAMAGED: "Dañados",
  DISPATCH_ACTION: "Despachar",
  EMPTY_UNITS:
    "Esta categoría todavía no tiene unidades registradas.",
  FREE_IN_MINUTES: (minutes: number): string =>
    `Libre en ${minutes} min`,
  FUEL_LABEL: "Combustible",
  FUEL_LEVEL: (level: number, max: number): string =>
    `${level}/${max}`,
  FUEL_NO_READING: "Sin lectura",
  IN_REPAIR: "En reparación",
  IN_USE_NOW: "En uso ahora",
  NOT_FOUND: "Esta categoría no existe o no es reservable.",
  OVERDUE_BADGE: "Vencida",
  PICKER_EMPTY:
    "No hay reservas pendientes de hoy que puedan llevar este equipo.",
  PICKER_TITLE: "Elija la reserva",
  OVERDUE_BY_MINUTES: (minutes: number): string =>
    `${minutes} min de retraso`,
  QUANTITY_AVAILABLE: "Disponibles",
  RESERVATION_LINK: "Ver reserva",
  RETURNS_AT: "Regresa a las",
  SELECTED_UNITS_COUNT: (count: number): string =>
    count === 1
      ? "1 unidad seleccionada"
      : `${count} unidades seleccionadas`,
  TOTAL: "Total",
  UNIT_CODE: "Código",
} as const;
