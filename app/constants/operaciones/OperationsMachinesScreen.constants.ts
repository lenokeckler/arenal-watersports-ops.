/**
 * `/operaciones/maquinas` (US-OPE-020): the entry list for everything that
 * gets corrected outside a dispatch — gas, hours, kilometers — grouped by
 * category the same way the retired "Equipos" screen worked
 * (`docs/decisiones/vista_mobile4.png`), minus its extra tap: each unit
 * links straight into `/operaciones/maquinas/[unitId]/correccion` instead
 * of stopping at a category picker first.
 */
export const OPERATIONS_MACHINES_SCREEN = {
  EMPTY:
    "No hay equipos con motor o que consuman gasolina.",
  SUBTITLE:
    "Gasolina, horas o kilómetros, categoría por categoría.",
  TITLE: "Equipos",
} as const;
