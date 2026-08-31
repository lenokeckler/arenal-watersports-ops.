/** `/reservas/nueva` (US-RES-004, US-RES-005, US-RES-006, US-RES-007). */
export const NEW_RESERVATION_SCREEN = {
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
  ICON: "add_circle",
  SUBTITLE:
    "Deja comprometido el equipo con los datos básicos de la salida.",
  SUBMIT: "Guardar reserva",
  TITLE: "Nueva reserva",
} as const;
