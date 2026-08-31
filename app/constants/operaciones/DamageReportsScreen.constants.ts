/**
 * `/operaciones/maquinas/[unitId]/danos` (US-OPE-013, US-OPE-014): raising
 * a damage report outside a close, and reading the ones already filed for
 * that machine.
 */
export const DAMAGE_REPORTS_SCREEN = {
  ERROR: {
    CAUSE_REQUIRED: "Escogé la causa del daño.",
    DESCRIPTION_REQUIRED: "Contá qué pasó.",
    GENERIC:
      "No se pudo registrar el reporte. Intentá de nuevo.",
  },
  FORM: {
    CAUSE_LABEL: "Causa",
    DESCRIPTION_LABEL: "Descripción de lo ocurrido",
    DESCRIPTION_PLACEHOLDER: "Qué pasó y cómo",
    IMPACT_LABEL: "Cuánto subió el conteo de golpes",
    OUT_OF_SERVICE_LABEL:
      "Sacar la unidad de disponibilidad",
    SUBMIT: "Registrar reporte",
    TITLE: "Reporte de daño",
  },
  HISTORY: {
    BY: (name: string): string => `Reportó ${name}`,
    EMPTY:
      "Esta máquina todavía no tiene reportes de daño.",
    FROM_RESERVATION: (code: string): string =>
      `Salida ${code}`,
    IMPACTS: (delta: number): string => `+${delta} golpes`,
    OUTSIDE_RESERVATION: "Fuera de una salida",
    TITLE: "Reportes anteriores",
  },
  IMPACT_SUMMARY: (count: number): string =>
    `${count} golpes acumulados`,
  TITLE: "Daños",
} as const;
