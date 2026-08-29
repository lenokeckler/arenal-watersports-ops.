/**
 * Resultado que reporta el cliente a POST /api/acceso/intento despues de
 * intentar `signInWithPassword` por su cuenta (seccion 1 y 6 del diseño del
 * modulo de acceso).
 */
export const LOGIN_ATTEMPT_OUTCOME = {
  FAILURE: "failure",
  SUCCESS: "success",
} as const;

export type LoginAttemptOutcome =
  (typeof LOGIN_ATTEMPT_OUTCOME)[keyof typeof LOGIN_ATTEMPT_OUTCOME];
