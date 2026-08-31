/**
 * Autenticacion del modulo de acceso. El ingreso es por nombre de usuario;
 * Supabase Auth trabaja con correo, asi que cada cuenta vive en auth.users
 * con un correo sintetico que el trabajador nunca ve ni escribe (seccion 1
 * del diseño). MAX_FAILED_ATTEMPTS es el limite que bloquea una cuenta
 * (seccion 6); la cuenta de administracion nunca llega a bloquearse con el.
 */
export const ACCESS_AUTH = {
  MAX_FAILED_ATTEMPTS: 10,
  SYNTHETIC_EMAIL_DOMAIN: "@arenal.local",
} as const;
