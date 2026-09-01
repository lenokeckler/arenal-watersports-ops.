/** Monday-first, matching `resolveCalendarRange`'s week start. */
export const WEEKDAYS_LABEL_MONO: readonly string[] = [
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
];

/** `/reservas/calendario` (US-RES-001, US-RES-002, US-RES-013). */
export const CALENDAR_SCREEN = {
  EMPTY_STATE: "No hay reservas agendadas en este período.",
  // A verb phrase on purpose (US-RES-001): "Hoy" alone, sitting right
  // under the date range, read as if it described the range being shown
  // instead of a link that jumps to today.
  GO_TO_TODAY: "Ir a hoy",
  ICON: "calendar_month",
  NEW_EXTERNAL_GUIDE: "Guía externo",
  NEW_RESERVATION: "Nueva reserva",
  SUBTITLE:
    "Qué hay agendado, a qué hora y con qué equipo.",
  TITLE: "Calendario de reservas",
  YEAR_MONTH_RESERVATIONS: (count: number): string =>
    count === 1 ? "1 reserva" : `${count} reservas`,
} as const;
