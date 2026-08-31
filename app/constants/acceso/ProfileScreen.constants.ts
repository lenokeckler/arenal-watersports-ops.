/**
 * Textos visibles de `/perfil` (US-ACC-004, US-ACC-005). No hay diseño de
 * Stitch para esta pantalla — se extrapola del lenguaje visual de
 * `ingreso-al-sistema--movil.html` (mismo panel de vidrio, misma tipografía).
 */
export const PROFILE_SCREEN = {
  AREA_LABEL: "Área",
  CHANGE_PASSWORD_BUTTON: "Cambiar Contraseña",
  EMAIL_ERROR: {
    GENERIC: "No se pudo guardar el correo. Intente de nuevo.",
    INVALID_FORMAT: "Ingrese un correo válido.",
    REQUIRED_FOR_ADMIN:
      "La cuenta de administración necesita un correo personal.",
  },
  EMAIL_HELPER:
    "Es el único destino del PIN para recuperar su contraseña.",
  EMAIL_LABEL: "Correo Personal",
  EMAIL_PLACEHOLDER: "correo@ejemplo.com",
  EMAIL_SAVE_BUTTON: "Guardar Correo",
  EMAIL_SECTION_TITLE: "Correo Personal",
  EMAIL_SUCCESS: "Correo actualizado correctamente.",
  PASSWORD_SECTION_DESCRIPTION:
    "Cambie su contraseña cuando lo necesite, sin esperar a que administración se la reponga.",
  PASSWORD_SECTION_TITLE: "Contraseña",
  TITLE: "Mi Perfil",
  USERNAME_LABEL: "Usuario",
} as const;
