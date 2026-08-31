/**
 * `/operaciones/cierre/[reservationId]` (US-OPE-009): how the equipment
 * came back, and — only when something happened — the damage report that
 * updates the unit's status for reservas to weigh against the deposit.
 */
export const RESERVATION_CLOSE_SCREEN = {
  ADD_DAMAGE: "Reportar daño en esta unidad",
  DAMAGE: {
    CAUSE_LABEL: "Causa",
    CAUSE_PLACEHOLDER: "Selecciona una causa...",
    CAUSE_REQUIRED: "Selecciona la causa del daño.",
    DESCRIPTION_LABEL: "Descripción",
    DESCRIPTION_PLACEHOLDER: "Describe qué ocurrió...",
    DESCRIPTION_REQUIRED:
      "Describe qué le pasó a la unidad.",
    IMPACT_LABEL: "Golpes que subió el conteo",
    REMOVE: "Quitar reporte",
    TITLE: "Reporte de daño",
  },
  EQUIPMENT_TITLE: "Equipo que regresó",
  ERROR: "No se pudo cerrar la reserva. Intenta de nuevo.",
  DEPARTURE_FUEL: (value: number): string =>
    `Salió con ${value}%`,
  DEPARTURE_USAGE: (value: number): string =>
    `Salió con ${value}`,
  FUEL_LABEL: "Gasolina final (%)",
  OK_NOTICE:
    "Si todo está en orden, no hace falta nada más aquí.",
  SUBMIT: "Cerrar salida",
  SUBTITLE: (customerName: string): string =>
    `Registrando el regreso de ${customerName}.`,
  TITLE: "Cierre de la salida",
  USAGE_LABEL: "Horas de motor",
} as const;
