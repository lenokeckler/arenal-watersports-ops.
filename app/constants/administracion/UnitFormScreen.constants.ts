/**
 * `/administracion/unidades/[categoryId]/nueva` and
 * `/administracion/unidades/[categoryId]/[unitId]` (US-ADM-016,
 * US-ADM-018). One shared set of labels for create and edit; the
 * decommission section only ever renders on edit, for a unit that is not
 * already decommissioned.
 */
export const UNIT_FORM_SCREEN = {
  CODE_LABEL: "Código",
  CODE_PLACEHOLDER: "Ej. JET-05",
  DECOMMISSION: {
    BUTTON: "Dar de baja",
    CONFIRM:
      "La unidad desaparecerá del inventario, del tablero y de todo lo que se pueda agendar. Su historial se conserva. ¿Continuar?",
    REASON_LABEL: "Motivo de la baja",
    REASON_PLACEHOLDER:
      "Ej. Vendida, pérdida total, destruida",
    TITLE: "Dar de baja",
  },
  DECOMMISSIONED_NOTE: "Esta unidad está dada de baja.",
  EDIT_TITLE: "Editar unidad",
  ERROR: {
    CODE_REQUIRED: "El código es obligatorio.",
    CODE_TAKEN: "Ya existe una unidad con ese código.",
    DECOMMISSION_REASON_REQUIRED:
      "El motivo de la baja es obligatorio.",
    GENERIC:
      "No se pudo guardar la unidad. Revise los datos.",
  },
  FUEL_LEVEL_LABEL: "Gasolina actual (líneas)",
  FUEL_MAX_LABEL: "Líneas máx",
  NEW_TITLE: "Nueva unidad",
  NEXT_OIL_CHANGE_LABEL:
    "Valor del próximo cambio de aceite",
  STATUS_LABEL: "Estado",
  SUBMIT: "Guardar unidad",
  USAGE_TOTAL_LABEL: "Uso acumulado",
} as const;
