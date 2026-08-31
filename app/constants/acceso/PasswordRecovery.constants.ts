/**
 * Recovery PIN (US-ACC-006, US-ACC-007, section 7 of the access module
 * design): six digits, ten-minute expiry, single use. Stored hashed in
 * `password_reset_pins`, which has row level security on with no policies
 * — only a service-role client ever reads or writes it.
 */
export const PASSWORD_RECOVERY = {
  PIN_LENGTH: 6,
  PIN_EXPIRY_MINUTES: 10,
} as const;

/**
 * The single response the two recovery routes ever return to the browser
 * on their "did we take your request" step (section 7: "la respuesta al
 * navegador es idéntica" whether the account does not exist, has no
 * personal email, or actually got a PIN) and on a failed verification
 * (wrong PIN, expired PIN, or unknown username all read the same, so a
 * guess cannot tell which one it was).
 */
export const PASSWORD_RECOVERY_MESSAGE = {
  PIN_REQUEST_GENERIC:
    "Si la cuenta existe y tiene un correo personal registrado, se envió un PIN.",
  VERIFY_INVALID:
    "El PIN ingresado es inválido o ya venció.",
} as const;
