/**
 * `/reservas/nueva` (US-RES-004 through US-RES-012). Extended in EP-RES-03/
 * EP-RES-04 with combos, extras and guides — the base fields (DETAILS,
 * EQUIPMENT, ERROR) are unchanged from EP-RES-02.
 */
export const NEW_RESERVATION_SCREEN = {
  COMBO: {
    CUSTOM_HINT:
      "El sistema propone el precio como la suma de las tarifas individuales; puedes ajustarlo si acordaste otro monto.",
    CUSTOM_MODE: "A la medida",
    CUSTOM_PRICE_LABEL: "Precio sugerido",
    EMPTY:
      "Administración no tiene combos armados todavía.",
    MODE_LABEL: "¿Cómo armas el combo?",
    PACKAGE_PRICE_LABEL: "Precio de paquete",
    PREDEFINED_MODE: "Predefinido",
    SELECT_LABEL: "Combo",
    SELECT_PLACEHOLDER: "Elige un combo",
    TITLE: "Combo",
    UNITS_REMAINING: (
      selected: number,
      required: number
    ): string => `${selected} de ${required} elegidas`,
  },
  DETAILS: {
    CUSTOMER_NAME_LABEL: "Nombre de la reserva",
    CUSTOMER_NAME_PLACEHOLDER: "Ej. Familia Rodríguez",
    DATE_LABEL: "Fecha",
    DURATION_LABEL: "Duración (minutos)",
    OUT_OF_HOURS_HINT:
      "El horario habitual es de 9 a 5, pero se puede agendar cualquier hora.",
    PEOPLE_COUNT_LABEL: "Cantidad de personas",
    TIME_LABEL: "Hora",
    TYPE_LABEL: "Tipo de reserva",
  },
  EQUIPMENT: {
    CATEGORY_UNAVAILABLE:
      "Sin equipo disponible en esta categoría.",
    FREE_OF_TOTAL: (free: number, total: number): string =>
      `${free} de ${total} libres en esta franja`,
    QUANTITY_LABEL: "Cantidad",
    TITLE: "Selección de equipo",
    UNIT_CONFLICT: (
      code: string,
      startsAt: string,
      endsAt: string
    ): string =>
      `Choca con la reserva ${code} (${startsAt} – ${endsAt})`,
    UNITS_EMPTY:
      "No hay unidades disponibles en esta categoría.",
    WARNING: {
      OVER_CAPACITY: (
        requested: number,
        free: number
      ): string =>
        `Pediste ${requested} y solo hay ${free} libres en esta franja.`,
    },
  },
  ERROR: {
    COMBO_REQUIRED: "Elige un combo de la lista.",
    COMBO_UNITS_INCOMPLETE:
      "Completa la cantidad de unidades que pide el combo.",
    CUSTOMER_NAME_REQUIRED:
      "Escribe a nombre de quién va la reserva.",
    DURATION_REQUIRED:
      "La duración debe ser mayor que cero.",
    EQUIPMENT_REQUIRED:
      "Asocia al menos un equipo a la reserva.",
    GENERIC:
      "No se pudo guardar la reserva. Intenta de nuevo.",
    PEOPLE_COUNT_REQUIRED:
      "La cantidad de personas debe ser mayor que cero.",
    STARTS_AT_REQUIRED:
      "Escoge la fecha y la hora de salida.",
  },
  EXTRAS: {
    OCCUPIES_HINT: "Descuenta disponibilidad",
    TITLE: "Extras",
  },
  GUIDES: {
    EMPTY:
      "No hay trabajadores marcados como guía todavía.",
    EXTERNAL_BADGE: "Externo",
    TITLE: "Guías del tour",
  },
  ICON: "add_circle",
  SUBTITLE:
    "Deja comprometido el equipo con los datos básicos de la salida.",
  SUBMIT: "Guardar reserva",
  TITLE: "Nueva reserva",
} as const;
