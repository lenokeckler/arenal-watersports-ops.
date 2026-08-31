import { CURRENCY_CODE } from "@/app/constants/tablero/Currency.constants";

/**
 * US-OPE-018: `maintenance_records.work_type` is free text because the
 * story says "cambio de llanta, cambio de pieza, cambio de aceite y en
 * general todo lo que se le haga al equipo". These are the shortcuts the
 * dock actually uses; `OTHER` opens the free-text field for the rest.
 */
export const MAINTENANCE_WORK_TYPE = {
  BATTERY: "Cambio de batería",
  GENERAL_CHECK: "Revisión general",
  HULL_REPAIR: "Reparación de casco",
  OIL_CHANGE: "Cambio de aceite",
  OTHER: "Otro",
  PART: "Cambio de pieza",
  TIRE: "Cambio de llanta",
} as const;

export type MaintenanceWorkType =
  (typeof MAINTENANCE_WORK_TYPE)[keyof typeof MAINTENANCE_WORK_TYPE];

export const MAINTENANCE_WORK_TYPE_PRESETS = [
  MAINTENANCE_WORK_TYPE.OIL_CHANGE,
  MAINTENANCE_WORK_TYPE.TIRE,
  MAINTENANCE_WORK_TYPE.PART,
  MAINTENANCE_WORK_TYPE.HULL_REPAIR,
  MAINTENANCE_WORK_TYPE.BATTERY,
  MAINTENANCE_WORK_TYPE.GENERAL_CHECK,
  MAINTENANCE_WORK_TYPE.OTHER,
] as const satisfies readonly MaintenanceWorkType[];

/** `/operaciones/mantenimiento` (US-OPE-012, US-OPE-017). */
export const MAINTENANCE_HUB_SCREEN = {
  OUT_OF_SERVICE: {
    EMPTY: "Todo el equipo está en servicio.",
    TITLE: "Fuera de servicio",
  },
  SERVICE_ALERTS: {
    EMPTY: "Ninguna máquina llegó a su cambio de aceite.",
    OVERDUE: (excess: string, metric: string): string =>
      `${excess} ${metric} pasado del umbral`,
    TITLE: "Cambio de aceite pendiente",
  },
  SUBTITLE:
    "Lo que está en el taller y lo que ya pide servicio.",
  TITLE: "Mantenimiento",
} as const;

/** `/operaciones/maquinas/[unitId]/mantenimiento` (US-OPE-018, US-OPE-019). */
export const MAINTENANCE_RECORD_SCREEN = {
  CURRENCIES: [
    CURRENCY_CODE.USD,
    CURRENCY_CODE.CRC,
  ] as const,
  ERROR: {
    DATE_REQUIRED: "Indicá la fecha del trabajo.",
    GENERIC:
      "No se pudo registrar el trabajo. Intentá de nuevo.",
    WORK_TYPE_REQUIRED: "Indicá qué se le hizo.",
  },
  FORM: {
    COST_LABEL: "Costo",
    COST_PLACEHOLDER: "Dejalo vacío si no costó nada",
    DATE_LABEL: "Fecha del trabajo",
    DESCRIPTION_LABEL: "Descripción",
    DESCRIPTION_PLACEHOLDER: "Qué se le hizo y por qué",
    EXTERNAL_LABEL: "Lo hizo un taller externo",
    NEXT_OIL_CHANGE_LABEL:
      "Nuevo umbral de cambio de aceite",
    NEXT_OIL_CHANGE_HELP:
      "Solo si este trabajo fue el cambio de aceite: mueve el aviso al próximo.",
    SUBMIT: "Registrar trabajo",
    TITLE: "Registrar mantenimiento",
    WORK_TYPE_LABEL: "Tipo de trabajo",
    WORK_TYPE_OTHER_LABEL: "¿Cuál trabajo?",
    WORK_TYPE_OTHER_PLACEHOLDER: "Escribilo",
  },
  HISTORY: {
    BY: (name: string): string => `Registró ${name}`,
    EMPTY:
      "Esta máquina todavía no tiene trabajos registrados.",
    EXTERNAL: "Taller externo",
    INTERNAL: "Trabajo interno",
    NO_COST: "Sin costo",
    TITLE: "Historial de mantenimiento",
  },
  TITLE: "Mantenimiento",
} as const;
