/**
 * Text for `/administracion/categorias` (US-ADM-012): the full inventory
 * catalogue — reservable and non-reservable alike — with the
 * table-with-filters pattern from `inventario-maestro-escritorio`.
 */
export const CATEGORIES_SCREEN = {
  ADD_BUTTON: "Nueva categoría",
  COLUMN: {
    NAME: "Categoría",
    RESERVABLE: "Reservable",
    STATUS: "Estado",
    TRACKING_MODE: "Modalidad",
  },
  EMPTY_STATE: "No hay categorías que coincidan con los filtros.",
  FILTER: {
    ALL_MODES: "Todas",
    ALL_STATUSES: "Todas",
    APPLY: "Buscar",
    MODE: "Modalidad",
    SEARCH_LABEL: "Categoría",
    SEARCH_PLACEHOLDER: "Buscar categoría...",
    STATUS: "Estado",
  },
  RESERVABLE_NO: "No",
  RESERVABLE_YES: "Sí",
  TITLE: "Categorías del inventario",
} as const;

/**
 * `/administracion/categorias/nueva` and
 * `/administracion/categorias/[categoryId]` (US-ADM-012 through
 * US-ADM-015). One shared set of labels: the create screen offers every
 * field, the edit screen renders `tracking_mode` disabled once the
 * category already has units or stock — the database's own trigger
 * (`categories_freeze_tracking_mode`) is what actually blocks the change,
 * this just avoids offering the control that would be rejected.
 */
export const CATEGORY_FORM_SCREEN = {
  ALERT: {
    EXPIRY_DAYS_LABEL: "Avisar con cuántos días de anticipación",
    MIN_QUANTITY_LABEL: "Cantidad mínima antes de avisar",
    TITLE: "Avisos",
  },
  BEHAVIOR: {
    CAN_BE_DAMAGED: "Se puede dañar",
    CONSUMES_FUEL: "Consume gasolina",
    DEFAULT_DURATION_LABEL: "Duración por defecto de una salida (minutos)",
    GUIDE_ONLY: "Solo sale con guía",
    HAS_CONDITION_PHOTOS: "Lleva fotos de estado",
    HAS_MOTOR: "Lleva motor",
    IS_RESERVABLE: "Es reservable",
    TITLE: "Comportamiento",
    USAGE_METRIC_LABEL: "Cómo se mide el uso",
  },
  DEACTIVATE: {
    BUTTON: "Marcar inactiva",
    CONFIRM:
      "Esta categoría ya tiene unidades o artículos registrados, así que no se puede eliminar. Se marcará como inactiva.",
  },
  DELETE: {
    BUTTON: "Eliminar categoría",
    CONFIRM: "Esta categoría no tiene registros. ¿Eliminarla?",
  },
  DEPOSIT: {
    CRC_LABEL: "Depósito en colones",
    TITLE: "Depósito de garantía",
    USD_LABEL: "Depósito en dólares",
  },
  EDIT_TITLE: "Editar categoría",
  ERROR: {
    GENERIC: "No se pudo guardar la categoría. Revise los datos.",
    NAME_REQUIRED: "El nombre es obligatorio.",
    NAME_TAKEN: "Ya existe una categoría con ese nombre.",
  },
  NAME_LABEL: "Nombre",
  NAME_PLACEHOLDER: "Ej. Drybags",
  NEW_TITLE: "Nueva categoría",
  REACTIVATE_BUTTON: "Reactivar categoría",
  SUBMIT: "Guardar categoría",
  TRACKING_MODE_LABEL: "Modalidad",
  TRACKING_MODE_LOCKED_HINT:
    "Ya tiene unidades o artículos registrados: la modalidad no se puede cambiar.",
} as const;
