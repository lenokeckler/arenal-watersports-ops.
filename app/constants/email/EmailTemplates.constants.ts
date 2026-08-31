import { PASSWORD_RECOVERY } from "@/app/constants/acceso/PasswordRecovery.constants";

/**
 * Copy for the recovery PIN email (US-ACC-006, US-ACC-007). Kept as a
 * function of the PIN rather than a static string so the expiry minutes
 * shown to the reader always match `PASSWORD_RECOVERY.PIN_EXPIRY_MINUTES`.
 */
export const RECOVERY_EMAIL = {
  SUBJECT: "Su PIN de recuperación — Arenal Ops",
  buildText: (pin: string): string =>
    `Su PIN para recuperar la contraseña es: ${pin}\n\n` +
    `Vence en ${PASSWORD_RECOVERY.PIN_EXPIRY_MINUTES} minutos y solo sirve una vez. ` +
    "Si usted no pidió este PIN, ignore este correo.",
  buildHtml: (pin: string): string =>
    "<p>Su PIN para recuperar la contraseña es:</p>" +
    `<p style="font-size:28px;font-weight:700;letter-spacing:0.2em;">${pin}</p>` +
    `<p>Vence en ${PASSWORD_RECOVERY.PIN_EXPIRY_MINUTES} minutos y solo sirve una vez. ` +
    "Si usted no pidió este PIN, ignore este correo.</p>",
} as const;
