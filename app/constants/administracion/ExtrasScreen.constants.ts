/**
 * `/administracion/extras` (US-ADM-019 through US-ADM-021): parrilla,
 * tubing, wake, tablas — the add-ons reservas attaches to a boat outing.
 * Same table-with-filters pattern as `CATEGORIES_SCREEN`.
 */
export const EXTRAS_SCREEN = {
  ADD_BUTTON: "Nuevo extra",
  COLUMN: {
    NAME: "Extra",
    OCCUPIES: "Ocupa inventario",
    PRICE: "Precio",
    STATUS: "Estado",
  },
  EMPTY_STATE: "No hay extras que coincidan con los filtros.",
  FILTER: {
    ALL_STATUSES: "Todos",
    APPLY: "Buscar",
    SEARCH_LABEL: "Extra",
    SEARCH_PLACEHOLDER: "Buscar extra...",
    STATUS: "Estado",
  },
  OCCUPIES_NO: "No",
  OCCUPIES_YES: "Sí",
  TITLE: "Extras",
} as const;

/**
 * `/administracion/extras/nueva` and `/administracion/extras/[extraId]`
 * (US-ADM-019 through US-ADM-021). Compatibility is defined per unit, not
 * per category — `extra_compatibility` — because two boats do not admit
 * the same extras (US-ADM-020). Only extras that occupy real inventory
 * (US-ADM-021) get an `occupies_category_id`/`occupies_quantity` pair, and
 * only `by_quantity` categories can be picked there: a `by_unit` category
 * has no aggregate count to occupy.
 */
export const EXTRA_FORM_SCREEN = {
  COMPATIBILITY: {
    EMPTY_STATE:
      "No hay unidades activas para marcar como compatibles todavía.",
    HINT: "Solo las unidades marcadas aquí se ofrecen al armar una reserva con esta embarcación.",
    TITLE: "Embarcaciones donde aplica",
  },
  DEACTIVATE: {
    BUTTON: "Marcar inactivo",
    CONFIRM:
      "Este extra ya se usó en una reserva, así que no se puede eliminar. Se marcará como inactivo.",
  },
  DELETE: {
    BUTTON: "Eliminar extra",
    CONFIRM: "Este extra nunca se usó en una reserva. ¿Eliminarlo?",
  },
  EDIT_TITLE: "Editar extra",
  ERROR: {
    GENERIC: "No se pudo guardar el extra. Revise los datos.",
    NAME_REQUIRED: "El nombre es obligatorio.",
    NAME_TAKEN: "Ya existe un extra con ese nombre.",
    OCCUPIES_QUANTITY_REQUIRED:
      "Indique cuánto ocupa de esa categoría.",
  },
  NAME_LABEL: "Nombre",
  NAME_PLACEHOLDER: "Ej. Tabla de wakeboard",
  NEW_TITLE: "Nuevo extra",
  OCCUPIES: {
    CATEGORY_LABEL: "Categoría del inventario que ocupa",
    CATEGORY_NONE_OPTION: "No ocupa inventario",
    HINT: "Solo aplica a categorías que se llevan por cantidad.",
    QUANTITY_LABEL: "Cuánto ocupa de esa categoría",
    TITLE: "Uso de inventario",
  },
  PRICE: {
    CRC_LABEL: "Precio en colones",
    TITLE: "Precio",
    USD_LABEL: "Precio en dólares",
  },
  REACTIVATE_BUTTON: "Reactivar extra",
  SUBMIT: "Guardar extra",
} as const;
