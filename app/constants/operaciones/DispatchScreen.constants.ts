/**
 * `/operaciones/despacho` (US-OPE-001, US-OPE-002, US-OPE-003, US-OPE-008):
 * today's reservations still waiting to go out, and the dispatch sheet that
 * commits the equipment and records fuel/hours for the motorized ones.
 */
export const DISPATCH_SCREEN = {
  /**
   * Sin esto la tarjeta imprime "4 PONTOON" de corrido, que en el muelle y
   * de reojo se lee como cuatro pontones en vez de cuatro personas.
   */
  SUMMARY_SEPARATOR: "·",
  BOARD_LINK: "Equipo despachado",
  CONFIRM_ERROR:
    "No se pudo despachar la reserva. Intenta de nuevo.",
  CONFIRM_SUBMIT: "Confirmar despacho",
  EMPTY: "No hay reservas pendientes de despachar hoy.",
  FUEL_LABEL: "Gasolina inicial (%)",
  GUIDES_EMPTY: "Sin guía asignado",
  MODAL_TITLE: "Despachar reserva",
  TITLE: "Reservas pendientes de despachar",
  TODAY_BADGE: "HOY",
  USAGE_LABEL: "Horas de motor",
} as const;
