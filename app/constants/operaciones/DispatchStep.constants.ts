/**
 * US-OPE-002: which part of the dispatch sheet is showing — the equipment
 * gets confirmed (and can be swapped) before the sheet ever asks for a
 * fuel/hours reading.
 */
export const DISPATCH_STEP = {
  EQUIPMENT: "equipment",
  READINGS: "readings",
} as const;

export type DispatchStep =
  (typeof DISPATCH_STEP)[keyof typeof DISPATCH_STEP];
