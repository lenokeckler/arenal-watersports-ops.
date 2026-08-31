import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import { createServiceRoleSupabaseClient } from "@/app/services";
import {
  PASSWORD_RECOVERY,
  PASSWORD_RECOVERY_MESSAGE,
  PASSWORD_RECOVERY_SCREEN,
} from "@/app/constants";
import { RECOVERY_EMAIL } from "@/app/constants/email/EmailTemplates.constants";
import {
  generateRecoveryPin,
  hashRecoveryPin,
} from "@/app/utils/acceso/passwordRecoveryPin";
import { sendMail } from "@/app/utils/email/sendMail";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { logServerError } from "@/app/utils/logging/logServerError";

export interface PasswordRecoveryPinRequestBody {
  username: string;
}

export type PasswordRecoveryPinResponseData = Record<
  string,
  never
>;

const isValidBody = (
  body: unknown
): body is PasswordRecoveryPinRequestBody => {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const { username } = body as Record<string, unknown>;

  return (
    typeof username === "string" &&
    username.trim().length > 0
  );
};

/**
 * Generates a PIN, stores it hashed, and emails it — only ever called once
 * the caller already knows the account exists and has a personal email.
 * Never throws to the caller: a broken mail relay must not turn into a
 * response that differs from the "account has no email" case.
 */
const issuePin = async (
  workerId: string,
  personalEmail: string
): Promise<void> => {
  const serviceRoleClient =
    createServiceRoleSupabaseClient();
  const pin = generateRecoveryPin();
  const expiresAt = new Date(
    Date.now() +
      PASSWORD_RECOVERY.PIN_EXPIRY_MINUTES * 60 * 1000
  ).toISOString();

  const { error: insertError } = await serviceRoleClient
    .from("password_reset_pins")
    .insert({
      expires_at: expiresAt,
      pin_hash: hashRecoveryPin(pin),
      worker_id: workerId,
    });

  if (insertError) {
    return;
  }

  try {
    await sendMail({
      html: RECOVERY_EMAIL.buildHtml(pin),
      subject: RECOVERY_EMAIL.SUBJECT,
      text: RECOVERY_EMAIL.buildText(pin),
      to: personalEmail,
    });
  } catch {
    // Swallowed on purpose (section 7 of the access module design): the
    // browser response must be identical whether the account does not
    // exist, has no email, or the email failed to send. A relay outage is
    // an operational problem to notice in server logs, not something the
    // requester's response shape may ever reveal.
  }
};

/**
 * `POST /api/acceso/pin-recuperacion` (US-ACC-006, US-ACC-007). Always
 * responds with the same generic success shape — whether `username` does
 * not exist, exists without a personal email, or actually got a PIN — so
 * this endpoint can never be used to enumerate usernames (section 7 of the
 * access module design, mirroring the login route's same discipline).
 */
export const POST = async (
  request: Request
): Promise<
  NextResponse<
    | SuccessResponse<PasswordRecoveryPinResponseData>
    | ErrorResponse
  >
> => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.badRequest(
      "Cuerpo de la solicitud inválido."
    );
  }

  if (!isValidBody(body)) {
    return Response.badRequest(
      "Cuerpo de la solicitud inválido."
    );
  }

  try {
    const serviceRoleClient =
      createServiceRoleSupabaseClient();
    const { data: worker, error } = await serviceRoleClient
      .from("workers")
      .select("id, personal_email")
      .eq("username", body.username.trim().toLowerCase())
      .maybeSingle();
    throwIfSupabaseError(
      error,
      "acceso.pinRecuperacion.fetchWorker"
    );

    if (worker?.personal_email) {
      await issuePin(worker.id, worker.personal_email);
    }

    return Response.success<PasswordRecoveryPinResponseData>(
      {},
      PASSWORD_RECOVERY_MESSAGE.PIN_REQUEST_GENERIC
    );
  } catch (error) {
    // A Supabase failure here must not be interpreted as "the account does
    // not exist" — it fails closed and visibly (a 500 logged server-side)
    // instead of silently skipping the PIN and reporting success.
    logServerError(error);
    return Response.internalError(
      PASSWORD_RECOVERY_SCREEN.ERROR.GENERIC
    );
  }
};
