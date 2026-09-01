/**
 * US-OPE-003/US-OPE-010: the quarter-tank shortcuts on the fuel gauge —
 * `equipment_units.current_fuel`/`reservation_items.fuel_out`/`fuel_in`
 * stay a 0–100 percentage; these are just the four presets the buttons
 * write into that same field, never a unit of their own.
 */
export const FUEL_LEVEL_PRESET = {
  FULL: 100,
  HALF: 50,
  QUARTER: 25,
  THREE_QUARTERS: 75,
} as const;

export type FuelLevelPreset =
  (typeof FUEL_LEVEL_PRESET)[keyof typeof FUEL_LEVEL_PRESET];

/** Render order for the gauge buttons — empty to full, left to right. */
export const FUEL_LEVEL_PRESET_ORDER: FuelLevelPreset[] = [
  FUEL_LEVEL_PRESET.QUARTER,
  FUEL_LEVEL_PRESET.HALF,
  FUEL_LEVEL_PRESET.THREE_QUARTERS,
  FUEL_LEVEL_PRESET.FULL,
];

export const FUEL_LEVEL_PRESET_LABEL = {
  [FUEL_LEVEL_PRESET.FULL]: "Lleno",
  [FUEL_LEVEL_PRESET.HALF]: "1/2",
  [FUEL_LEVEL_PRESET.QUARTER]: "1/4",
  [FUEL_LEVEL_PRESET.THREE_QUARTERS]: "3/4",
} as const satisfies Record<FuelLevelPreset, string>;
