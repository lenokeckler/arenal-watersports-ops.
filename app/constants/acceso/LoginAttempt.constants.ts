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

/**
 * Server-side failure of `POST /api/acceso/intento` itself (a Supabase query
 * failing, not a wrong password). The client already treats a non-`ok`
 * response as a neutral failed attempt (`useLoginFormViewModel`), so this
 * message only ever reaches the server log via `console.error`.
 */
export const LOGIN_ATTEMPT_MESSAGE = {
  ERROR: {
    GENERIC:
      "No se pudo procesar el intento de acceso. Intente de nuevo.",
  },
} as const;
