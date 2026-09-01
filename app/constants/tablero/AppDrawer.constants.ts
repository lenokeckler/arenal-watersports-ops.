/**
 * Texts for `AppDrawer` (US-ACC-008, US-ACC-011, US-TAB-004 through
 * US-TAB-007): the left-side panel that replaced the compact
 * `WorkAreaSwitcher` pill. Identity labels are not repeated here — they
 * reuse `PROFILE_SCREEN.USERNAME_LABEL` / `PROFILE_SCREEN.AREA_LABEL`, and
 * the logout label reuses `WORK_MODE_SCREEN.LOGOUT`, so the same word is
 * never defined twice.
 */
export const APP_DRAWER_SCREEN = {
  AREA_SWITCHER_TITLE: "Cambiar de área",
  CLOSE_ARIA: "Cerrar menú",
  LOGOUT_CONFIRM: "¿Confirmar cierre de sesión?",
  NAV_ARIA_LABEL: "Navegación secundaria",
  PREFERENCES_TITLE: "Preferencias",
  SECONDARY_NAV_TITLE: "Más opciones",
  TITLE: "Menú",
} as const;
