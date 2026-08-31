/**
 * `/operaciones/inventario` and `/operaciones/inventario/[categoryId]`
 * (US-OPE-021, US-OPE-022, US-OPE-025). The single registry of everything
 * the company owns, seen the way operaciones works with it: category by
 * category, to count and to mark state.
 */
export const OPERATIONS_INVENTORY_SCREEN = {
  ALERTS_BANNER: (count: number): string =>
    count === 1
      ? "1 aviso del inventario sin atender"
      : `${count} avisos del inventario sin atender`,
  CATEGORY: {
    AVAILABLE: "Disponibles",
    DAMAGED: "Dañados",
    IN_MAINTENANCE: "En mantenimiento",
    IN_REPAIR: "En reparación",
    TOTAL: "Total",
  },
  DETAIL: {
    ERROR:
      "No se pudo guardar el cambio. Intentá de nuevo.",
    MOVEMENTS: {
      BY: (name: string): string => `Ajustó ${name}`,
      EMPTY:
        "Todavía no hay ajustes registrados en esta categoría.",
      TITLE: "Ajustes anteriores",
    },
    QUANTITY_TITLE: "Cantidades",
    REASON_LABEL: "Motivo del ajuste",
    REASON_PLACEHOLDER: "Por qué cambia la cantidad",
    REASON_REQUIRED: "Escriba el motivo del ajuste.",
    SIGNATURE_NOTICE:
      "El ajuste queda registrado a su nombre.",
    STOCK_MISSING:
      "Esta categoría todavía no tiene existencias registradas. Administración las crea desde su ficha.",
    SUBMIT: "Guardar ajuste",
    UNITS_EMPTY:
      "Esta categoría todavía no tiene unidades registradas.",
    UNITS_TITLE: "Unidades",
  },
  EMPTY: "No hay categorías activas en el inventario.",
  LINKS: {
    ALERTS: "Avisos",
    COUNT_HISTORY: "Historial de conteos",
    MAINTENANCE: "Mantenimiento",
    NEW_COUNT: "Levantar un conteo",
  },
  SUBTITLE:
    "Todo lo que tiene la empresa, categoría por categoría.",
  TITLE: "Inventario",
} as const;
