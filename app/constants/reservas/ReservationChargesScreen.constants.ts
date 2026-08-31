/**
 * `/reservas/cobros/[reservationId]` (EP-RES-07, US-RES-023 through
 * US-RES-031). Every figure this screen shows is per currency: the system
 * has no exchange rate, so dollars and colones are two columns and never
 * one total (US-RES-025).
 */
export const RESERVATION_CHARGES_SCREEN = {
  BACK_TO_DETAIL: "Volver al detalle",
  CHARGE_FORM: {
    ADJUST_HINT:
      "El monto propuesto es la tarifa por la duración. Ajústelo si el precio acordado fue otro.",
    AMOUNT_LABEL: "Monto a cobrar",
    CURRENCY_LABEL: "Moneda",
    ERROR: {
      AMOUNT_REQUIRED: "Escriba un monto mayor que cero.",
      GENERIC:
        "No se pudo registrar el cobro. Intente de nuevo.",
      METHOD_REQUIRED: "Indique con qué pagó el cliente.",
    },
    KIND_LABEL: "Concepto",
    METHOD_LABEL: "Método de pago",
    METHOD_OTHER_LABEL: "¿Cuál método?",
    METHOD_OTHER_PLACEHOLDER: "Ej. Depósito bancario",
    NO_PROPOSAL:
      "No hay tarifa de catálogo para este equipo en esta moneda: escriba el monto acordado.",
    PROPOSAL_LABEL: "Propuesto por catálogo",
    SUBMIT: "Registrar cobro",
    TITLE: "Registrar pago",
    USE_PROPOSAL: "Usar el propuesto",
  },
  DEPOSIT: {
    AMOUNT_LABEL: "Monto del depósito",
    CURRENCY_LABEL: "Moneda",
    EMPTY: "Esta salida no lleva depósito de garantía.",
    ERROR: {
      AMOUNT_REQUIRED:
        "Escriba el monto del depósito recibido.",
      GENERIC:
        "No se pudo registrar el depósito. Intente de nuevo.",
      REASON_REQUIRED:
        "Explique por qué se retiene el depósito.",
      RETAINED_OVER_AMOUNT:
        "No se puede retener más de lo que el cliente depositó.",
      RETAINED_REQUIRED:
        "Escriba cuánto se retiene, mayor que cero.",
      RESOLVE_GENERIC:
        "No se pudo resolver el depósito. Intente de nuevo.",
    },
    HELD_NOTICE:
      "Esta plata es del cliente y la empresa solo la está guardando. Queda pendiente hasta resolverla.",
    PROPOSAL_LABEL: "Propuesto por categoría",
    REGISTER_SUBMIT: "Registrar recepción",
    RESOLUTION: {
      LOCKED:
        "El depósito se resuelve cuando operaciones cierra la salida, o cuando la reserva se cancela.",
      REASON_LABEL: "Motivo de la retención",
      REASON_PLACEHOLDER:
        "Ej. Casco rayado en el lado derecho",
      RETAINED_LABEL: "Monto retenido",
      RETURN: "Devolver completo",
      RETURN_HINT:
        "El equipo volvió en orden: el depósito queda liberado.",
      SUBMIT: "Resolver depósito",
      TITLE: "Resolver depósito",
      RETAIN_PARTIAL: "Retener una parte",
      RETAIN_TOTAL: "Retener todo",
    },
    RESOLVED_BY: (fullName: string): string =>
      `Resuelto por ${fullName}`,
    SPLIT_CHILD_BLOCKED:
      "El depósito se queda con la reserva original. Esta salida nació de una división.",
    TITLE: "Depósito de garantía",
  },
  EXTRA_TIME: {
    COURTESY_HINT:
      "Si el tiempo de más va de cortesía, no registre ningún cobro.",
    DETECTED: (minutes: number): string =>
      `Esta salida lleva ${minutes} min de más.`,
    NONE: "La salida no se pasó de su hora.",
    TITLE: "Tiempo adicional",
  },
  MOVEMENTS: {
    EMPTY: "Todavía no hay movimientos de dinero.",
    REFUND_LABEL: (percentage: number): string =>
      `Devolución del ${percentage}%`,
    TITLE: "Movimientos",
  },
  REFUND: {
    AMOUNT_PREVIEW: "Se devolverá",
    CURRENCY_LABEL: "Moneda",
    ERROR: {
      GENERIC:
        "No se pudo registrar la devolución. Intente de nuevo.",
      NOTHING_CHARGED:
        "No hay nada cobrado en esa moneda para devolver.",
      OVER_NET:
        "La devolución no puede pasar de lo que queda cobrado en esa moneda.",
      PERCENTAGE_RANGE: "El porcentaje va de 0 a 100.",
      REASON_REQUIRED:
        "Escriba el motivo de la devolución.",
    },
    HINT: "El porcentaje se calcula sobre lo cobrado en esa moneda y se descuenta del ingreso del día.",
    PERCENTAGE_LABEL: "Porcentaje devuelto",
    REASON_LABEL: "Motivo",
    REASON_PLACEHOLDER:
      "Ej. Cancelación por lluvia, se devuelve la mitad",
    SUBMIT: "Registrar devolución",
    TITLE: "Devolución",
  },
  SPLIT_CHILD_NOTICE:
    "Esta salida nació de una división: el cobro de la tarifa se quedó completo en la reserva original y aquí solo se cobra el tiempo adicional que corra por su cuenta.",
  SUMMARY: {
    AGREED: "Acordado",
    CHARGED: "Cobrado",
    EMPTY: "Todavía no hay nada cobrado ni acordado.",
    EXTRA_TIME: "Tiempo adicional",
    LIST: "Precio de lista",
    MIXED_CURRENCY_NOTICE:
      "Este cobro entró en dos monedas. El sistema no convierte, así que lo pendiente de cada moneda se calcula solo contra lo acordado en esa misma moneda.",
    NET: "Neto",
    PENDING: "Pendiente",
    REFUNDED: "Devuelto",
    TITLE: "Estado del cobro",
  },
  TITLE: "Cobro y depósitos",
} as const;
