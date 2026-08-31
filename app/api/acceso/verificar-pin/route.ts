import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import { createServiceRoleSupabaseClient } from "@/app/services";
import {
  PASSWORD_RECOVERY_MESSAGE,
  PASSWORD_RECOVERY_SCREEN,
} from "@/app/constants";
import { verifyRecoveryPin } from "@/app/utils/acceso/passwordRecoveryPin";
import { checkPasswordValidity } from "@/app/utils/password/passwordUtils";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { logServerError } from "@/app/utils/logging/logServerError";

export interface PasswordRecoveryVerifyRequestBody {
  username: string;
  pin: string;
  newPassword: string;
}

export type PasswordRecoveryVerifyResponseData = Record<
  string,
  never
>;

const isValidBody = (
  body: unknown
): body is PasswordRecoveryVerifyRequestBody => {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const { username, pin, newPassword } = body as Record<
    string,
    unknown
  >;

  return (
    typeof username === "string" &&
    username.trim().length > 0 &&
    typeof pin === "string" &&
    /^\d{6}$/.test(pin) &&
    typeof newPassword === "string" &&
    newPassword.length > 0
  );
};

const isNewPasswordValid = (password: string): boolean => {
  const validity = checkPasswordValidity(password);
  return (
    validity.isLengthValid &&
    validity.isUpperValid &&
    validity.isLowerValid &&
    validity.isNumberValid &&
    validity.isSymbolValid
  );
};

/**
 * `POST /api/acceso/verificar-pin` (US-ACC-006, US-ACC-007). Verifies the
 * PIN against its stored hash, rejects it if used or expired, resets the
 * password with the service role key (the only way to do it without
 * knowing the old one), marks the PIN used, and — the entire point of
 * US-ACC-007 — resets `failed_attempts` to zero, since a recovery is the
 * administration account's only way back in past ten failures.
 *
 * One generic error for every rejection (unknown username, wrong PIN, used
 * PIN, expired PIN): distinguishing them would let a guess narrow down
 * which username exists, exactly what section 7 rules out.
 */
export const POST = async (
  request: Request
): Promise<
  NextResponse<
    | SuccessResponse<PasswordRecoveryVerifyResponseData>
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

  if (!isNewPasswordValid(body.newPassword)) {
    return Response.badRequest(
      "La contraseña nueva no cumple los requisitos.",
      "newPassword"
    );
  }

  try {
    const serviceRoleClient =
      createServiceRoleSupabaseClient();

    const { data: worker, error: workerError } =
      await serviceRoleClient
        .from("workers")
        .select("id")
        .eq("username", body.username.trim().toLowerCase())
        .maybeSingle();
    throwIfSupabaseError(
      workerError,
      "acceso.verificarPin.fetchWorker"
    );

    if (!worker) {
      return Response.badRequest(
        PASSWORD_RECOVERY_MESSAGE.VERIFY_INVALID
      );
    }

    const {
      data: candidatePins,
      error: candidatePinsError,
    } = await serviceRoleClient
      .from("password_reset_pins")
      .select("id, pin_hash")
      .eq("worker_id", worker.id)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString());
    throwIfSupabaseError(
      candidatePinsError,
      "acceso.verificarPin.fetchCandidatePins"
    );

    const matchingPin = (candidatePins ?? []).find(
      (candidate) =>
        verifyRecoveryPin(body.pin, candidate.pin_hash)
    );

    if (!matchingPin) {
      return Response.badRequest(
        PASSWORD_RECOVERY_MESSAGE.VERIFY_INVALID
      );
    }

    const { error: updatePasswordError } =
      await serviceRoleClient.auth.admin.updateUserById(
        worker.id,
        {
          password: body.newPassword,
        }
      );

    if (updatePasswordError) {
      return Response.internalError(
        "No se pudo restablecer la contraseña. Intente de nuevo."
      );
    }

    await serviceRoleClient
      .from("password_reset_pins")
      .update({ used_at: new Date().toISOString() })
      .eq("id", matchingPin.id);

    // US-ACC-007: completing a recovery resets the failed-attempts counter —
    // for the administration account this is its only way back in past ten.
    //
    // Tambien levanta el cambio obligatorio. Quien acaba de recuperar
    // eligio su propia contrasena, que es exactamente lo que el primer
    // ingreso existe para forzar (US-ACC-003): dejarlo puesto mandaba a
    // alguien que perdio la temporal antes de estrenarla a cambiar la clave
    // que acababa de elegir, dos pantallas seguidas para lo mismo.
    await serviceRoleClient
      .from("workers")
      .update({
        failed_attempts: 0,
        must_change_password: false,
      })
      .eq("id", worker.id);

    return Response.success<PasswordRecoveryVerifyResponseData>(
      {}
    );
  } catch (error) {
    // A Supabase failure here must never read as "the PIN does not match" —
    // it fails closed and visibly (a 500 logged server-side) instead of
    // closed and silent.
    logServerError(error);
    return Response.internalError(
      PASSWORD_RECOVERY_SCREEN.ERROR.GENERIC
    );
  }
};
