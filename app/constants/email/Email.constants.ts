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
export const EMAIL_CONFIG = {
  FROM: process.env.SMTP_FROM || "no-reply@arenal.local",
  HOST: process.env.SMTP_HOST || "127.0.0.1",
  PORT: Number(process.env.SMTP_PORT) || 54325,
} as const;
