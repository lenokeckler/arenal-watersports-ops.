/**
 * `/administracion` (EP-ADM-01 through EP-ADM-04, in progress). A small hub
 * linking into the sections built so far. `PATHS.ADMIN` already reserves
 * routes for the sections a later dispatch owns (combos, tarifas,
 * reportes) — this screen only links to what actually exists today.
 */
export const ADMIN_HUB_SCREEN = {
  CATEGORIES: {
    DESCRIPTION:
      "Comportamiento, depósitos y avisos del inventario.",
    TITLE: "Categorías del inventario",
  },
  EXTRAS: {
    DESCRIPTION:
      "Parrilla, tubing, wake y tablas para las salidas de lancha.",
    TITLE: "Extras",
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
