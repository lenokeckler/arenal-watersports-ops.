import nodemailer from "nodemailer";
import {
  EMAIL_CONFIG,
  isImplicitTlsPort,
} from "@/app/constants/email/Email.constants";

export interface SendMailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Sends one email through the SMTP transport configured in
 * `EMAIL_CONFIG` — Supabase's local Inbucket in development, a real relay
 * in production. Server-only: never import this from a Client Component.
 * A dedicated transporter is created per call rather than cached at module
 * scope, since a single recovery email every so often does not justify
 * managing a pooled connection's lifecycle.
 */
export const sendMail = async ({
  to,
  subject,
  text,
  html,
}: SendMailParams): Promise<void> => {
  // Sin usuario estamos contra el Inbucket local, que no pide credenciales
  // y rechaza el cifrado. Con usuario estamos saliendo a un relay de
  // verdad, donde mandar la contrasena en claro seria regalarla: ahi se
  // autentica y se cifra siempre.
  const hasCredentials = Boolean(EMAIL_CONFIG.USER);

  const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.HOST,
    port: EMAIL_CONFIG.PORT,
    ...(hasCredentials
      ? {
          auth: {
            pass: EMAIL_CONFIG.PASSWORD,
            user: EMAIL_CONFIG.USER,
          },
          requireTLS: !isImplicitTlsPort(EMAIL_CONFIG.PORT),
          secure: isImplicitTlsPort(EMAIL_CONFIG.PORT),
        }
      : { ignoreTLS: true, secure: false }),
  });

  await transporter.sendMail({
    from: EMAIL_CONFIG.FROM,
    to,
    subject,
    text,
    html,
  });
};
