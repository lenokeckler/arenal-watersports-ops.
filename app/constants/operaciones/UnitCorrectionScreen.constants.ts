/**
 * `/operaciones/maquinas/[unitId]/correccion` (US-OPE-020): what somebody
 * fixes when nobody dispatched anything — the tank was filled, the oil was
 * changed, a scratch showed up. Every box left empty stays untouched.
 */
export const UNIT_CORRECTION_SCREEN = {
  ERROR: {
    GENERIC:
      "No se pudo guardar la corrección. Intentá de nuevo.",
    NOTHING_TO_CORRECT: "No cambiaste ningún dato todavía.",
  },
  FORM: {
    CURRENT_VALUE: (value: string): string =>
      `Ahora: ${value}`,
    FUEL_LABEL: "Gasolina (% del tanque)",
    IMPACTS_LABEL: "Golpes acumulados",
    KEEP_STATUS: "Dejarlo como está",
    STATUS_LABEL: "Estado",
    SUBMIT: "Guardar corrección",
    USAGE_LABEL: "Lectura acumulada del instrumento",
  },
  SIGNATURE_NOTICE:
    "La corrección queda registrada a tu nombre.",
  SUBTITLE:
    "Ajustá lo que pasó fuera de una salida. Lo que dejés vacío no se toca.",
  TITLE: "Corregir datos",
} as const;
