/**
 * US-RES-001: the four levels of detail the calendar can show. Reservas
 * picks whichever one fits what it is doing right now; operaciones only
 * ever needs today and this week, so `OPERATIONS_CALENDAR_VIEWS` is the
 * subset the calendar page falls back to for that area.
 */
export const CALENDAR_VIEW = {
  DAY: "day",
  MONTH: "month",
  WEEK: "week",
  YEAR: "year",
} as const;

export type CalendarView =
  (typeof CALENDAR_VIEW)[keyof typeof CALENDAR_VIEW];

export const CALENDAR_VIEW_LABEL = {
  [CALENDAR_VIEW.DAY]: "Día",
  [CALENDAR_VIEW.MONTH]: "Mes",
  [CALENDAR_VIEW.WEEK]: "Semana",
  [CALENDAR_VIEW.YEAR]: "Año",
} as const satisfies Record<CalendarView, string>;

export const ALL_CALENDAR_VIEWS: readonly CalendarView[] = [
  CALENDAR_VIEW.DAY,
  CALENDAR_VIEW.WEEK,
  CALENDAR_VIEW.MONTH,
  CALENDAR_VIEW.YEAR,
];

export const OPERATIONS_CALENDAR_VIEWS: readonly CalendarView[] =
  [CALENDAR_VIEW.DAY, CALENDAR_VIEW.WEEK];

export const DEFAULT_CALENDAR_VIEW: CalendarView =
  CALENDAR_VIEW.WEEK;

/**
 * US-OPE-007: operaciones opens the calendar on today, not the week —
 * reservas/administración keep `DEFAULT_CALENDAR_VIEW` (week).
 */
export const DEFAULT_OPERATIONS_CALENDAR_VIEW: CalendarView =
  CALENDAR_VIEW.DAY;

/** The `?view=` search param every calendar link and redirect reads/writes. */
export const CALENDAR_VIEW_QUERY_PARAM = "view";

/**
 * The `localStorage` key the last-used calendar view is saved under —
 * device-only, same convention as `THEME_STORAGE_KEY`.
 */
export const CALENDAR_VIEW_STORAGE_KEY =
  "arenal-ops-calendar-view";
