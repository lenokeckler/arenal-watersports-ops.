/**
 * Motivo por el que `changeOwnPassword` (US-ACC-003, US-ACC-004) no pudo
 * cambiar la contraseña. `CURRENT_PASSWORD_INCORRECT` es el único que se
 * muestra junto a un campo — ver `app/utils/acceso/changePassword.ts`.
 */
export const CHANGE_PASSWORD_FAILURE_REASON = {
  CURRENT_PASSWORD_INCORRECT: "current_password_incorrect",
  UNEXPECTED_ERROR: "unexpected_error",
} as const;

export type ChangePasswordFailureReason =
  (typeof CHANGE_PASSWORD_FAILURE_REASON)[keyof typeof CHANGE_PASSWORD_FAILURE_REASON];
