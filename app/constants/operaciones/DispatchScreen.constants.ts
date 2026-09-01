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
  /** US-OPE-002: the equipment-confirmation step, before any reading is asked for. */
  EQUIPMENT_STEP: {
    CONTINUE: "Continuar",
    EMPTY_ERROR:
      "Selecciona al menos un equipo para despachar.",
    ERROR:
      "No se pudo actualizar el equipo. Intenta de nuevo.",
    LOCKED_NOTE:
      "El equipo de este combo no se cambia aquí.",
    TITLE: "Confirma el equipo que sale",
  },
  FUEL_LABEL: "Gasolina inicial",
  GUIDES_EMPTY: "Sin guía asignado",
  MODAL_TITLE: "Despachar reserva",
  /** Una linea por cantidad sin unidad propia — kayaks, paddleboards, etc. */
  QUANTITY_ROW: (
    categoryName: string,
    quantity: number
  ): string => `${categoryName} × ${quantity}`,
  TITLE: "Reservas pendientes de despachar",
  TODAY_BADGE: "HOY",
  USAGE_LABEL: "Horas de motor",
} as const;
