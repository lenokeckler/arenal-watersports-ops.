import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/app/services";
import {
  ACCESS_AUTH,
  WORK_AREA,
  WORKER_FORM_SCREEN,
  WORKER_MARK,
  type WorkArea,
} from "@/app/constants";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";
import { generateTemporaryPassword } from "@/app/utils/generators/temporaryPassword";

export interface CreateWorkerRequestBody {
  baseRole: WorkArea;
  expiresAt: string | null;
  fullName: string;
  isExternalGuide: boolean;
  nationalId: string | null;
  username: string;
}

export interface CreateWorkerResponseData {
  temporaryPassword: string;
  username: string;
  workerId: string;
}

const UNIQUE_VIOLATION_CODE = "23505";

const VALID_BASE_ROLES: readonly WorkArea[] = [
  WORK_AREA.ADMINISTRATION,
  WORK_AREA.OPERATIONS,
  WORK_AREA.RESERVATIONS,
];

const isValidBody = (
  body: unknown
): body is CreateWorkerRequestBody => {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const { fullName, username, baseRole, isExternalGuide } =
    body as Record<string, unknown>;

  return (
    typeof fullName === "string" &&
    fullName.trim().length > 0 &&
    typeof username === "string" &&
    username.trim().length > 0 &&
    typeof baseRole === "string" &&
    VALID_BASE_ROLES.includes(baseRole as WorkArea) &&
    typeof isExternalGuide === "boolean"
  );
};

/**
 * `POST /api/administracion/trabajadores` (US-ADM-001, US-ADM-005). Writes
 * to `auth.users`, so this can only ever run behind the service role, on
 * the server (`api-mutation-standards` / the module brief's "creating a
 * worker needs the service role"). The service role bypasses RLS
 * entirely, so the same shape `workers_insert` enforces at the database —
 * administración can create anyone, reservas with the
 * `registro_guias_externos` mark can only create a temporary external
 * guide — is re-checked here by hand before anything is written.
 */
export const POST = async (
  request: Request
): Promise<
  NextResponse<SuccessResponse<CreateWorkerResponseData> | ErrorResponse>
> => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.badRequest("Cuerpo de la solicitud inválido.");
  }

  if (!isValidBody(body)) {
    return Response.badRequest("Cuerpo de la solicitud inválido.");
  }

  const serverClient = await createServerSupabaseClient();
  const {
    data: { user: caller },
  } = await serverClient.auth.getUser();

  if (!caller) {
    return Response.unauthorized("Sesión no válida.");
  }

  const serviceRoleClient = createServiceRoleSupabaseClient();
  const { isAdmin, isExternalGuideRegistrar } =
    await fetchWorkerPermissionState(serviceRoleClient, caller.id);

  if (!isAdmin && !isExternalGuideRegistrar) {
    return Response.forbidden(
      "No tiene permiso para crear trabajadores."
    );
  }

  // Reservas (sin ser administración) solo puede crear la cuenta temporal
  // de guía externo, con esta forma exacta — igual que `workers_insert`.
  const baseRole = isAdmin ? body.baseRole : WORK_AREA.OPERATIONS;
  const isExternalGuide = isAdmin ? body.isExternalGuide : true;

  if (isExternalGuide && (!body.nationalId || !body.expiresAt)) {
    return Response.badRequest(
      !body.nationalId
        ? WORKER_FORM_SCREEN.ERROR.NATIONAL_ID_REQUIRED
        : WORKER_FORM_SCREEN.ERROR.EXPIRY_REQUIRED
    );
  }

  const effectiveBaseRole = isExternalGuide
    ? WORK_AREA.OPERATIONS
    : baseRole;
  const nationalId = isExternalGuide ? body.nationalId : null;
  const expiresAt = isExternalGuide ? body.expiresAt : null;

  const username = body.username.trim().toLowerCase();
  const fullName = body.fullName.trim();
  const temporaryPassword = generateTemporaryPassword();
  const syntheticEmail = `${username}${ACCESS_AUTH.SYNTHETIC_EMAIL_DOMAIN}`;

  const { data: createdAuthUser, error: authError } =
    await serviceRoleClient.auth.admin.createUser({
      email: syntheticEmail,
      email_confirm: true,
      password: temporaryPassword,
    });

  if (authError || !createdAuthUser.user) {
    return Response.badRequest(
      WORKER_FORM_SCREEN.ERROR.USERNAME_TAKEN,
      "username"
    );
  }

  const newWorkerId = createdAuthUser.user.id;

  const { error: workerInsertError } = await serviceRoleClient
    .from("workers")
    .insert({
      base_role: effectiveBaseRole,
      created_by: caller.id,
      expires_at: expiresAt,
      full_name: fullName,
      id: newWorkerId,
      is_external_guide: isExternalGuide,
      must_change_password: true,
      national_id: nationalId,
      updated_by: caller.id,
      username,
    });

  const markInsertError = workerInsertError
    ? null
    : isExternalGuide
      ? (
          await serviceRoleClient.from("worker_marks").insert({
            granted_by: caller.id,
            mark: WORKER_MARK.GUIDE,
            worker_id: newWorkerId,
          })
        ).error
      : null;

  if (workerInsertError || markInsertError) {
    await serviceRoleClient.auth.admin.deleteUser(newWorkerId);

    return Response.badRequest(
      workerInsertError?.code === UNIQUE_VIOLATION_CODE
        ? WORKER_FORM_SCREEN.ERROR.USERNAME_TAKEN
        : WORKER_FORM_SCREEN.ERROR.GENERIC,
      "username"
    );
  }

  return Response.created<CreateWorkerResponseData>({
    temporaryPassword,
    username,
    workerId: newWorkerId,
  });
};
