/**
 * Text for `/inventario` (referenced by US-TAB-001: "los chalecos, los
 * remos y los extintores... viven en el inventario, que es otra pantalla
 * y sirve para contar, no para agendar"). Read-only counting view over
 * every category, reservable or not; server-paginated (US-TAB-008).
 */
export const INVENTORY_SCREEN = {
  COLUMN: {
    AVAILABLE: "Disponible",
    CATEGORY: "Categoría",
    DAMAGED: "Dañado",
    IN_REPAIR: "En reparación",
    MODE: "Modalidad",
    TOTAL: "Total",
  },
  EMPTY_STATE: "No hay categorías que coincidan con los filtros.",
  FILTER: {
    ALL_MODES: "Todas",
    APPLY: "Buscar",
    MODE: "Modalidad",
    SEARCH_LABEL: "Categoría",
    SEARCH_PLACEHOLDER: "Buscar categoría...",
  },
  TITLE: "Inventario",
} as const;
