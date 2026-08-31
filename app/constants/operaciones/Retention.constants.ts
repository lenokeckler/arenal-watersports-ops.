/**
 * RNF-032: "el historial de conteos de inventario se conserva un año hacia
 * atrás". The database enforces it in `purge_expired_records`
 * (`20260828001400_realtime_retention.sql`, `count_cutoff := now() -
 * interval '1 year'`); the history screen uses the same window so it never
 * offers a range the purge is allowed to have already emptied.
 */
export const RETENTION = {
  COUNT_HISTORY_YEARS: 1,
} as const;
