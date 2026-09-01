/**
 * `FuelLevelPicker`'s tappable lines carry no visible text (US-OPE-003/
 * US-OPE-010, `docs/decisiones/vista_mobile4.png`), so each one needs an
 * accessible name of its own.
 */
export const FUEL_LEVEL_PICKER_SCREEN = {
  LINE_LABEL: (line: number, max: number): string =>
    `Línea ${line} de ${max}`,
} as const;
