import nodemailer from "nodemailer";
import { EMAIL_CONFIG } from "@/app/constants/email/Email.constants";

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
  const transporter = nodemailer.createTransport({
    host: EMAIL_CONFIG.HOST,
    port: EMAIL_CONFIG.PORT,
    secure: false,
    ignoreTLS: true,
  });

  await transporter.sendMail({
    from: EMAIL_CONFIG.FROM,
    to,
    subject,
    text,
    html,
  });
};
