/**
 * `/administracion/unidades/[categoryId]` when the category is
 * `by_quantity` (US-ADM-017): the single existence row plus the movement
 * history that replaces a ficha for these categories.
 */
export const STOCK_FORM_SCREEN = {
  ERROR: {
    GENERIC:
      "No se pudo guardar el conteo. Revise los datos.",
    REASON_REQUIRED: "El motivo del cambio es obligatorio.",
  },
  EXPIRY_DATE_LABEL: "Fecha de vencimiento",
  HISTORY: {
    COLUMN: {
      AVAILABLE: "Disponibles",
      DAMAGED: "Dañados",
      DATE: "Fecha",
      IN_REPAIR: "En reparación",
      REASON: "Motivo",
    },
    EMPTY_STATE: "Todavía no hay movimientos registrados.",
    TITLE: "Historial de conteos",
  },
  QUANTITY_AVAILABLE_LABEL: "Disponibles",
  QUANTITY_DAMAGED_LABEL: "Dañados",
  QUANTITY_IN_REPAIR_LABEL: "En reparación",
  REASON_LABEL: "Motivo del cambio",
  REASON_PLACEHOLDER:
    "Ej. Conteo físico, pérdida, compra nueva",
  SUBMIT: "Guardar conteo",
  TITLE: "Existencias",
} as const;
