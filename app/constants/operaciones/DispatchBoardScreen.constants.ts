/**
 * `/operaciones` (US-OPE-004, US-OPE-005, US-OPE-006, US-OPE-008): the
 * equipment currently out on the water, how long until it is back, and the
 * one flagged overdue.
 */
export const DISPATCH_BOARD_SCREEN = {
  ADJUST: {
    ERROR:
      "No se pudo ajustar la duración. Intenta de nuevo.",
    EXTENDED_NOTICE:
      "Al extender, reservas decide después si cobra las horas de más.",
    MINUTES_LABEL: "Duración total (minutos)",
    SUBMIT: "Guardar duración",
    TITLE: "Ajustar duración",
  },
  CLOSE_ACTION: "Cerrar salida",
  DISPATCH_LINK: "Pendientes de despachar",
  EMPTY: "No hay equipo despachado en este momento.",
  GUIDES_EMPTY: "Sin guía asignado",
  OVERDUE_BADGE: "Vencida",
  OVERDUE_MINUTES: (minutes: number): string =>
    `${minutes} min de retraso`,
  REMAINING_MINUTES: (minutes: number): string =>
    `${minutes} min`,
  RETURNS_AT: "Regresa",
  SUBTITLE: "Equipo actualmente en el agua.",
  TITLE: "Equipo despachado",
} as const;
