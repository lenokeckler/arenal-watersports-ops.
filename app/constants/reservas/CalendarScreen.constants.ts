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

/** `/reservas/calendario` (US-RES-001, US-RES-002). */
export const CALENDAR_SCREEN = {
  EMPTY_STATE: "No hay reservas agendadas en este período.",
  ICON: "calendar_month",
  NEW_RESERVATION: "Nueva reserva",
  SUBTITLE:
    "Qué hay agendado, a qué hora y con qué equipo.",
  TITLE: "Calendario de reservas",
  TODAY: "Hoy",
  YEAR_MONTH_RESERVATIONS: (count: number): string =>
    count === 1 ? "1 reserva" : `${count} reservas`,
} as const;
