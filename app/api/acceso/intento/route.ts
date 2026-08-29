import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/app/services";
import {
  LOGIN_ATTEMPT_OUTCOME,
  type LoginAttemptOutcome,
  WORK_AREA,
  WORKER_STATUS,
} from "@/app/constants";
import { evaluateLoginAttempt } from "@/app/utils/acceso/loginAttempt";

export interface LoginAttemptRequestBody {
  outcome: LoginAttemptOutcome;
  username: string;
}

export interface LoginAttemptResponseData {
  isBlocked: boolean;
  recoveryAvailable: boolean;
}

const NEUTRAL_RESULT: LoginAttemptResponseData = {
  isBlocked: false,
  recoveryAvailable: false,
};

const isValidBody = (
  body: unknown
): body is LoginAttemptRequestBody => {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const { username, outcome } = body as Record<string, unknown>;

  return (
    typeof username === "string" &&
    username.trim().length > 0 &&
    (outcome === LOGIN_ATTEMPT_OUTCOME.SUCCESS ||
      outcome === LOGIN_ATTEMPT_OUTCOME.FAILURE)
  );
};

/**
 * Resets the counter on a correct login. Never trusts the client's claim of
 * "success" by itself: it only resets the account behind the request's own
 * Supabase Auth session, proven by `auth.getUser()`. Trusting an unproven
 * claim here would let anyone erase another account's failed-attempt count
 * without ever knowing its password.
 */
const resetOwnFailedAttempts = async (
  username: string
): Promise<void> => {
  const serverClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return;
  }

  const serviceRoleClient = createServiceRoleSupabaseClient();

  await serviceRoleClient
    .from("workers")
    .update({ failed_attempts: 0 })
    .eq("id", user.id)
    .eq("username", username);
};

/**
 * Counts one more failure for `username` and blocks the account at the
 * limit, unless it holds the administration area (US-ACC-007), in which
 * case it offers recovery instead. Returns the neutral result when the
 * username does not exist, identical in shape to a failure under the limit,
 * so the response never reveals which case it was (US-ACC-002).
 */
const recordFailedAttempt = async (
  username: string
): Promise<LoginAttemptResponseData> => {
  const serviceRoleClient = createServiceRoleSupabaseClient();

  const { data: worker } = await serviceRoleClient
    .from("workers")
    .select("id, failed_attempts")
    .eq("username", username)
    .maybeSingle();

  if (!worker) {
    return NEUTRAL_RESULT;
  }

  const { data: administrationMembership } =
    await serviceRoleClient
      .from("worker_areas")
      .select("worker_id")
      .eq("worker_id", worker.id)
      .eq("area", WORK_AREA.ADMINISTRATION)
      .maybeSingle();

  const nextFailedAttempts = worker.failed_attempts + 1;
  const { isBlocked, recoveryAvailable } = evaluateLoginAttempt({
    failedAttempts: nextFailedAttempts,
    isAdministrationAccount: Boolean(administrationMembership),
  });

  await serviceRoleClient
    .from("workers")
    .update({
      failed_attempts: nextFailedAttempts,
      ...(isBlocked ? { status: WORKER_STATUS.BLOCKED } : {}),
    })
    .eq("id", worker.id);

  return { isBlocked, recoveryAvailable };
};

/**
 * Records the outcome of a login attempt the client already resolved
 * against Supabase Auth directly (section 1 of the access module design).
 * Blocks a regular account at ten failures and never the administration
 * account (section 6 / US-ACC-007), and resets the counter on success
 * (US-ACC-007). Uses the service role key because a Client Component
 * cannot write another account's `failed_attempts`.
 */
export const POST = async (
  request: Request
): Promise<
  NextResponse<
    SuccessResponse<LoginAttemptResponseData> | ErrorResponse
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

  const { username, outcome } = body;

  if (outcome === LOGIN_ATTEMPT_OUTCOME.SUCCESS) {
    await resetOwnFailedAttempts(username);

    return Response.success<LoginAttemptResponseData>(
      NEUTRAL_RESULT
    );
  }

  const result = await recordFailedAttempt(username);

  return Response.success<LoginAttemptResponseData>(result);
};
