/**
 * Textos visibles de las dos pantallas de cambio de contraseña (US-ACC-003,
 * US-ACC-004): `/acceso/primer-ingreso` y `/acceso/cambio-contrasena`.
 * Comparten formulario y componente (`PasswordChangeForm`) porque el flujo
 * es el mismo — confirmar la contraseña vigente, escribir la nueva, repetirla
 * — así que sus diferencias de copia viven en un único objeto en lugar de
 * duplicar el archivo entero.
 */
export const PASSWORD_CHANGE_MODE = {
  FIRST_LOGIN: "first_login",
  VOLUNTARY: "voluntary",
} as const;

export type PasswordChangeMode =
  (typeof PASSWORD_CHANGE_MODE)[keyof typeof PASSWORD_CHANGE_MODE];

export const PASSWORD_CHANGE_SCREEN = {
  CONFIRM_PASSWORD_LABEL: "Repetir Contraseña Nueva",
  CONFIRM_PASSWORD_PLACEHOLDER: "Repita la contraseña nueva",
  ERROR: {
    CONFIRM_MISMATCH: "Las contraseñas no coinciden.",
    CURRENT_PASSWORD_REQUIRED: "Ingrese su contraseña actual.",
    GENERIC: "No se pudo cambiar la contraseña. Intente de nuevo.",
    NEW_PASSWORD_INVALID:
      "La contraseña nueva no cumple los requisitos.",
    NEW_PASSWORD_REQUIRED: "Ingrese la contraseña nueva.",
  },
  [PASSWORD_CHANGE_MODE.FIRST_LOGIN]: {
    CURRENT_PASSWORD_ERROR:
      "La contraseña temporal ingresada es incorrecta.",
    CURRENT_PASSWORD_LABEL: "Contraseña Temporal",
    CURRENT_PASSWORD_PLACEHOLDER:
      "Ingrese la contraseña temporal",
    SUBMIT: "Confirmar y Continuar",
    SUBTITLE:
      "Por seguridad, confirme su contraseña temporal y cree una nueva antes de continuar.",
    TITLE: "Cambio de Contraseña Obligatorio",
  },
  NEW_PASSWORD_LABEL: "Contraseña Nueva",
  NEW_PASSWORD_PLACEHOLDER: "Cree una contraseña nueva",
  SUCCESS: "Contraseña actualizada correctamente.",
  [PASSWORD_CHANGE_MODE.VOLUNTARY]: {
    BACK_TO_PROFILE: "Volver a mi perfil",
    CURRENT_PASSWORD_ERROR:
      "La contraseña actual ingresada es incorrecta.",
    CURRENT_PASSWORD_LABEL: "Contraseña Actual",
    CURRENT_PASSWORD_PLACEHOLDER: "Ingrese su contraseña actual",
    SUBMIT: "Actualizar Contraseña",
    SUBTITLE:
      "Confirme su contraseña actual para establecer una nueva.",
    TITLE: "Cambiar Contraseña",
  },
} as const;
