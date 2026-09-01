/**
 * `/reservas/detalle/[reservationId]` (US-RES-003, US-RES-018 through
 * US-RES-022).
 */
export const RESERVATION_DETAIL_SCREEN = {
  ACTIONS: {
    CANCEL: "Cancelar",
    EDIT: "Modificar",
    POSTPONE: "Posponer",
    SPLIT: "Dividir",
  },
  CANCEL: {
    BACK: "Volver",
    CONFIRM: "Confirmar cancelación",
    ERROR:
      "No se pudo cancelar la reserva. Intenta de nuevo.",
    REASON_HINT: "Sin motivo el historial no explica nada.",
    REASON_LABEL: "Motivo de cancelación",
    REASON_PLACEHOLDER:
      "Ej. Cliente no se presentó, clima adverso...",
    REASON_REQUIRED: "Escribe el motivo de la cancelación.",
    SUBTITLE_DISPATCHED:
      "Esta salida está en curso. Al cancelarla, operaciones deberá registrar después cómo volvió el equipo.",
    SUBTITLE_SCHEDULED:
      "La reserva dejará de verse en operaciones y pasará al historial.",
    TITLE: "Cancelar reserva",
  },
  CHARGES: {
    AGREED: "Precio acordado",
    CHARGED: "Cobrado",
    EMPTY: "Sin cobro registrado",
    LIST: "Precio de lista",
    MANAGE: "Cobro y depósitos",
    TITLE: "Estado del cobro",
  },
  EDIT: {
    COMBO_LOCKED_NOTE:
      "El equipo de un combo no se edita aquí: cancela y crea una reserva nueva si el paquete cambió.",
    EQUIPMENT_TITLE: "Equipo comprometido",
    ERROR:
      "No se pudo guardar el cambio. Intenta de nuevo.",
    SUBMIT: "Guardar cambios",
    TITLE: "Modificar reserva",
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
    COMBO: "Combo",
    CREATED_BY: (fullName: string): string =>
      `Creada por ${fullName}`,
    DISPATCHED_AT: "Salió",
    DURATION: "Duración",
    PEOPLE_COUNT: "Personas",
    TITLE: "Detalle de la salida",
    UPDATED_BY: (fullName: string): string =>
      `Última modificación de ${fullName}`,
  },
  NOT_FOUND: "Esta reserva ya no existe.",
  POSTPONE: {
    CLOSING_FUEL_LABEL: "Combustible al regresar (%)",
    CLOSING_TITLE: "Equipo que sí se usó",
    CLOSING_USAGE_LABEL: "Lectura al regresar",
    DATE_LABEL: "Nueva fecha",
    DISPATCHED_WARNING:
      "Solo se pospone por clima. Registre el equipo que sí se usó.",
    ERROR:
      "No se pudo posponer la reserva. Intenta de nuevo.",
    REASON_LABEL: "Motivo",
    REASON_PLACEHOLDER:
      "Ej. Tormenta eléctrica imprevista, a solicitud del cliente...",
    REASON_REQUIRED_WEATHER:
      "Explica la condición de clima que obliga a posponer.",
    SCHEDULED_NOTICE:
      "El cobro y el depósito se conservan para la fecha nueva. Al cliente no se le vuelve a cobrar.",
    STARTS_AT_REQUIRED: "Escoge la fecha y la hora nuevas.",
    SUBMIT: "Actualizar fecha",
    TIME_LABEL: "Nueva hora",
    TITLE: "Posponer reserva",
  },
  SPLIT: {
    EQUIPMENT_TITLE: "Equipo",
    ERROR:
      "No se pudo dividir la reserva. Intenta de nuevo.",
    INFO_NOTICE:
      "El cobro y el depósito se quedan completos en la reserva original. La segunda salida nace sin cobro propio.",
    MOVE_ALL: "Toda",
    NEW_DEPARTURE: "Salida nueva",
    ORIGINAL_DEPARTURE: "Salida original",
    PEOPLE_LABEL: "Personas",
    PEOPLE_REQUIRED:
      "Indica cuántas personas van en la salida nueva.",
    SUBMIT: "Confirmar división",
    TITLE: "Dividir salida",
  },
} as const;
