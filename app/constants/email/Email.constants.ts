/**
 * SMTP transport for server-sent mail — currently only the recovery PIN
 * (US-ACC-006, US-ACC-007). In local development Supabase's Inbucket
 * exposes a real SMTP submission port (`supabase/config.toml`,
 * `[local_smtp].smtp_port`) that requires no auth, so the app can send a
 * real email and read it back without any external SMTP credentials. A
 * production deployment overrides these three with real values through
 * env vars; nothing here is a secret worth hardcoding differently per
 * environment.
 */
// `||`, not `??`: this project's `.env.local` already declares
// `SMTP_HOST`/`SMTP_PORT` as empty strings (scaffolded for a later real
// deployment), and `??` only falls back on `null`/`undefined` — an empty
// string would win and silently point this at host `""`, port `0`.
const SECURE_SMTP_PORT = 465;

export const EMAIL_CONFIG = {
  FROM: process.env.SMTP_FROM || "no-reply@arenal.local",
  HOST: process.env.SMTP_HOST || "127.0.0.1",
  /**
   * Un relay de verdad —Gmail, Resend, cualquiera— exige credenciales; el
   * Inbucket local no las pide y las rechazaria. Que existan o no decide
   * tambien si se cifra la conexion: sin usuario estamos hablando con
   * localhost, con usuario estamos saliendo a internet con una contrasena
   * adentro.
   */
  PASSWORD: process.env.SMTP_PASSWORD || "",
  PORT: Number(process.env.SMTP_PORT) || 54325,
  USER: process.env.SMTP_USER || "",
} as const;

/** El puerto 465 habla TLS desde el saludo; los demas lo negocian con STARTTLS. */
export const isImplicitTlsPort = (port: number): boolean =>
  port === SECURE_SMTP_PORT;
