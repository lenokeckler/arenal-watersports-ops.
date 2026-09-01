/**
 * US-RES-004/US-OPE-006: rentals in Costa Rica are talked about in hours,
 * not raw minutes ("30 minutos" or "1 hora", never "90 minutos") — these
 * are the quick-pick buttons next to the free-form duration field, shared
 * by the new-reservation form and the dispatch board's duration adjuster.
 * `reservations.duration_minutes` stays the stored unit; these are only
 * the shortcuts that write into it.
 */
export const DURATION_PRESET = {
  HALF_HOUR: 30,
  ONE_HOUR: 60,
  ONE_HOUR_THIRTY: 90,
  THREE_HOURS: 180,
  TWO_HOURS: 120,
} as const;

export type DurationPreset =
  (typeof DURATION_PRESET)[keyof typeof DURATION_PRESET];

/** Render order for the duration buttons — shortest to longest. */
export const DURATION_PRESET_ORDER: DurationPreset[] = [
  DURATION_PRESET.HALF_HOUR,
  DURATION_PRESET.ONE_HOUR,
  DURATION_PRESET.ONE_HOUR_THIRTY,
  DURATION_PRESET.TWO_HOURS,
  DURATION_PRESET.THREE_HOURS,
];

export const DURATION_PRESET_LABEL = {
  [DURATION_PRESET.HALF_HOUR]: "30m",
  [DURATION_PRESET.ONE_HOUR]: "1h",
  [DURATION_PRESET.ONE_HOUR_THIRTY]: "1.5h",
  [DURATION_PRESET.TWO_HOURS]: "2h",
  [DURATION_PRESET.THREE_HOURS]: "3h",
} as const satisfies Record<DurationPreset, string>;
