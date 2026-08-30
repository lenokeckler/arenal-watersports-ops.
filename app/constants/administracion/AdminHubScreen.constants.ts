/**
 * `/administracion` (EP-ADM-01 through EP-ADM-05, in progress). A small hub
 * linking into the sections built so far. `PATHS.ADMIN` already reserves a
 * route for `reportes` (EP-ADM-06), the last section, which stays unlinked
 * until it exists.
 */
export const ADMIN_HUB_SCREEN = {
  CATEGORIES: {
    DESCRIPTION:
      "Comportamiento, depósitos y avisos del inventario.",
    TITLE: "Categorías del inventario",
  },
  COMBOS: {
    DESCRIPTION:
      "Paquetes que se venden seguido, con su propio precio.",
    TITLE: "Combos",
  },
  EXTRAS: {
    DESCRIPTION:
      "Parrilla, tubing, wake y tablas para las salidas de lancha.",
    TITLE: "Extras",
  },
  RATES: {
    DESCRIPTION:
      "El precio de referencia por categoría y tipo de salida.",
    TITLE: "Tarifas",
  },
  TITLE: "Administración",
  UNITS: {
    DESCRIPTION:
      "Unidades identificadas y artículos por cantidad.",
    TITLE: "Unidades y artículos",
  },
  WORKERS: {
    DESCRIPTION:
      "Cuentas, roles, áreas y marcas del equipo.",
    TITLE: "Trabajadores",
  },
} as const;
