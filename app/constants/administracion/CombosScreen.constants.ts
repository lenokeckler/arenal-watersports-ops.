/**
 * `/administracion/combos` (US-ADM-022, US-ADM-023): packages that sell
 * often, like lancha con jet ski y paddleboard, priced as a package instead
 * of the sum of the parts.
 */
export const COMBOS_SCREEN = {
  ADD_BUTTON: "Nuevo combo",
  COLUMN: {
    NAME: "Combo",
    PRICE: "Precio de paquete",
    STATUS: "Estado",
  },
  EMPTY_STATE:
    "No hay combos que coincidan con los filtros.",
  FILTER: {
    ALL_STATUSES: "Todos",
    APPLY: "Buscar",
    SEARCH_LABEL: "Combo",
    SEARCH_PLACEHOLDER: "Buscar combo...",
    STATUS: "Estado",
  },
  TITLE: "Combos",
} as const;

/**
 * `/administracion/combos/nueva` and `/administracion/combos/[comboId]`
 * (US-ADM-022, US-ADM-023). `combo_items` is the group of categories (with
 * quantity) that make up the package; the package price is its own field,
 * independent of any individual tariff.
 */
export const COMBO_FORM_SCREEN = {
  DEACTIVATE: {
    BUTTON: "Marcar inactivo",
    CONFIRM:
      "Este combo ya se vendió, así que no se puede eliminar. Se marcará como inactivo.",
  },
  DELETE: {
    BUTTON: "Eliminar combo",
    CONFIRM: "Este combo nunca se vendió. ¿Eliminarlo?",
  },
  EDIT_TITLE: "Editar combo",
  ERROR: {
    GENERIC:
      "No se pudo guardar el combo. Revise los datos.",
    ITEMS_REQUIRED: "Agregue al menos un equipo al combo.",
    NAME_REQUIRED: "El nombre es obligatorio.",
    NAME_TAKEN: "Ya existe un combo con ese nombre.",
  },
  ITEMS: {
    ADD_BUTTON: "Agregar equipo",
    CATEGORY_ALREADY_ADDED:
      "Ese equipo ya está en el combo.",
    CATEGORY_LABEL: "Categoría",
    EMPTY_STATE: "Este combo todavía no tiene equipos.",
    NEW_COMBO_HINT:
      "Guarde el combo primero para poder agregarle equipos.",
    QUANTITY_LABEL: "Cantidad",
    REMOVE_BUTTON: "Quitar",
    TITLE: "Equipos del combo",
  },
  NAME_LABEL: "Nombre",
  NAME_PLACEHOLDER: "Ej. Paquete Familiar",
  NEW_TITLE: "Nuevo combo",
  PACKAGE_PRICE: {
    CRC_LABEL: "Precio de paquete en colones",
    TITLE: "Precio de paquete",
    USD_LABEL: "Precio de paquete en dólares",
  },
  REACTIVATE_BUTTON: "Reactivar combo",
  SUBMIT: "Guardar combo",
} as const;
