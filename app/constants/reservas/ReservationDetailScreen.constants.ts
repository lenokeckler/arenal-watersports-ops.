/** `/reservas/detalle/[reservationId]` (US-RES-003). */
export const RESERVATION_DETAIL_SCREEN = {
  CHARGES: {
    EMPTY: "Sin cobro registrado",
    TITLE: "Estado del cobro",
  },
  EQUIPMENT: {
    EMPTY: "Sin equipo asociado todavía.",
    TITLE: "Equipo y extras",
  },
  GUIDES: {
    EMPTY: "Sin guías asignados.",
    TITLE: "Guías",
  },
  META: {
    CANCELLATION_REASON: "Motivo de cancelación",
    CREATED_BY: (fullName: string): string =>
      `Creada por ${fullName}`,
    DISPATCHED_AT: "Salió",
    DURATION: "Duración",
    DURATION_VALUE: (minutes: number): string =>
      `${minutes} min`,
    PEOPLE_COUNT: "Personas",
    TITLE: "Detalle de la salida",
    UPDATED_BY: (fullName: string): string =>
      `Última modificación de ${fullName}`,
  },
  NOT_FOUND: "Esta reserva ya no existe.",
} as const;
