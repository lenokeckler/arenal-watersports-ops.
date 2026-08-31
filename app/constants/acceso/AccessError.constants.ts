/**
 * Claves de error del ingreso (US-ACC-002). "Usuario no existe" y
 * "contraseña incorrecta" comparten INVALID_CREDENTIALS a propósito: son los
 * dos casos que permitirían enumerar nombres de usuario, así que no llevan
 * mensaje propio. Ver seccion 2 del diseño del modulo de acceso.
 */
export const ACCESS_ERROR = {
  BLOCKED_ADMIN: "BLOCKED_ADMIN",
  BLOCKED_ATTEMPTS: "BLOCKED_ATTEMPTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  SESSION_EXPIRED: "SESSION_EXPIRED",
} as const;

export type AccessErrorKey =
  (typeof ACCESS_ERROR)[keyof typeof ACCESS_ERROR];

export const ACCESS_ERROR_MESSAGE = {
  BLOCKED_ADMIN: "Cuenta bloqueada por administración.",
  BLOCKED_ATTEMPTS:
    "Cuenta bloqueada por intentos fallidos. Busque a administración.",
  INVALID_CREDENTIALS: "Usuario o contraseña incorrectos.",
  SESSION_EXPIRED: "Su sesión se cerró por inactividad.",
} as const satisfies Record<AccessErrorKey, string>;

/**
 * Nombre del parámetro de consulta que lleva una `AccessErrorKey` de vuelta
 * al login (sección 2 del diseño: SESSION_EXPIRED, y ahora BLOCKED_ADMIN
 * cuando el proxy cierra una sesión abierta por bloqueo, "llegan como
 * parámetro" en vez de mostrarse junto a un campo del formulario).
 */
export const ACCESS_ERROR_QUERY = {
  PARAM: "motivo",
} as const;
