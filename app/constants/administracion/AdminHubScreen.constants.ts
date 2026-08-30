/**
 * `/administracion` (EP-ADM-01, EP-ADM-02). A small hub linking into the
 * sections this dispatch builds. `PATHS.ADMIN` already reserves routes for
 * the sections the next dispatch owns (combos, extras, tarifas, reportes,
 * unidades) — this screen only links to what actually exists today.
 */
export const ADMIN_HUB_SCREEN = {
  CATEGORIES: {
    DESCRIPTION: "Comportamiento, depósitos y avisos del inventario.",
    TITLE: "Categorías del inventario",
  },
  TITLE: "Administración",
  WORKERS: {
    DESCRIPTION: "Cuentas, roles, áreas y marcas del equipo.",
    TITLE: "Trabajadores",
  },
} as const;
