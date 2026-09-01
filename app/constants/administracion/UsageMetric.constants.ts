/**
 * Mirrors the database's `usage_metric` enum: how a motorized category's
 * use is measured (US-ADM-013). Water equipment with a motor tracks engine
 * hours; quad bikes track kilometers. Only meaningful when the category
 * `has_motor` — the database itself ties the two together
 * (`categories_motor_needs_metric` / `categories_metric_needs_motor`).
 */
export const USAGE_METRIC = {
  ENGINE_HOURS: "engine_hours",
  KILOMETERS: "kilometers",
} as const;

export type UsageMetric =
  (typeof USAGE_METRIC)[keyof typeof USAGE_METRIC];

export const USAGE_METRIC_LABEL = {
  [USAGE_METRIC.ENGINE_HOURS]: "Horas de motor",
  [USAGE_METRIC.KILOMETERS]: "Kilómetros",
} as const satisfies Record<UsageMetric, string>;

/**
 * Compact unit abbreviation for a tight read where the full label does not
 * fit — `/tablero/categoria/[categoryId]`'s unit card shows "222 h" next to
 * the code and fuel gauge, not "Horas de motor: 222".
 */
export const USAGE_METRIC_SUFFIX = {
  [USAGE_METRIC.ENGINE_HOURS]: "h",
  [USAGE_METRIC.KILOMETERS]: "km",
} as const satisfies Record<UsageMetric, string>;
