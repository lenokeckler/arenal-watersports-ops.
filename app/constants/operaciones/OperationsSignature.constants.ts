/**
 * RNF-022 / RNF-023: every operations record carries who signed it. The
 * name is resolved through `worker_display_names`; this is what a history
 * shows when that lookup comes back empty — a worker whose account was
 * removed from the directory, never a blank cell that reads as "nobody".
 */
export const OPERATIONS_SIGNATURE = {
  UNKNOWN_AUTHOR: "Trabajador no identificado",
} as const;
