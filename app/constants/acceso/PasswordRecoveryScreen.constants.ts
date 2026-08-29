/**
 * Textos visibles de `/acceso/recuperar-contrasena` (US-ACC-006,
 * US-ACC-007). Dos pasos en una sola pantalla: pedir el PIN escribiendo el
 * usuario, y después escribir el PIN junto con la contraseña nueva.
 */
export const PASSWORD_RECOVERY_STEP = {
  REQUEST_PIN: "request_pin",
  RESET_PASSWORD: "reset_password",
} as const;

export type PasswordRecoveryStep =
  (typeof PASSWORD_RECOVERY_STEP)[keyof typeof PASSWORD_RECOVERY_STEP];

export const PASSWORD_RECOVERY_SCREEN = {
  BACK_TO_LOGIN: "Volver al ingreso",
  CONFIRM_PASSWORD_LABEL: "Repetir Contraseña Nueva",
  CONFIRM_PASSWORD_PLACEHOLDER: "Repita la contraseña nueva",
  ERROR: {
    CONFIRM_MISMATCH: "Las contraseñas no coinciden.",
    GENERIC: "No se pudo completar la solicitud. Intente de nuevo.",
    NEW_PASSWORD_INVALID:
      "La contraseña nueva no cumple los requisitos.",
    NEW_PASSWORD_REQUIRED: "Ingrese la contraseña nueva.",
    PIN_REQUIRED: "Ingrese el PIN de 6 dígitos.",
    USERNAME_REQUIRED: "Ingrese su usuario.",
  },
  NEW_PASSWORD_LABEL: "Contraseña Nueva",
  NEW_PASSWORD_PLACEHOLDER: "Cree una contraseña nueva",
  PIN_HELPER:
    "El PIN vence a los 10 minutos y solo sirve una vez.",
  PIN_LABEL: "PIN de Verificación",
  PIN_PLACEHOLDER: "000000",
  [PASSWORD_RECOVERY_STEP.REQUEST_PIN]: {
    SUBMIT: "Enviar PIN",
    SUBTITLE:
      "Escriba su usuario. Si la cuenta tiene un correo personal registrado, le enviaremos un PIN de 6 dígitos.",
    TITLE: "Recuperar Contraseña",
  },
  [PASSWORD_RECOVERY_STEP.RESET_PASSWORD]: {
    CHANGE_USERNAME: "Usar otro usuario",
    SUBMIT: "Restablecer Contraseña",
    SUBTITLE:
      "Escriba el PIN que le llegó por correo y cree su contraseña nueva.",
    TITLE: "Escriba el PIN",
  },
  SUCCESS: "Contraseña restablecida. Ya puede ingresar.",
  SUCCESS_PIN_SENT:
    "Si la cuenta existe y tiene un correo personal registrado, se envió un PIN. Revise su correo.",
  USERNAME_LABEL: "Usuario / ID Operador",
  USERNAME_PLACEHOLDER: "Ingrese su ID",
} as const;
