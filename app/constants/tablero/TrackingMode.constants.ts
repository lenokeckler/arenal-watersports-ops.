/**
 * Mirrors the database's `tracking_mode` enum (section 4.1 of the data
 * model design): the hybrid that decides whether a category lists
 * individual units or a single quantity row.
 */
export const TRACKING_MODE = {
  BY_QUANTITY: "by_quantity",
  BY_UNIT: "by_unit",
} as const;

export type TrackingMode =
  (typeof TRACKING_MODE)[keyof typeof TRACKING_MODE];

export const TRACKING_MODE_LABEL = {
  [TRACKING_MODE.BY_QUANTITY]: "Por cantidad",
  [TRACKING_MODE.BY_UNIT]: "Por unidad",
} as const satisfies Record<TrackingMode, string>;
