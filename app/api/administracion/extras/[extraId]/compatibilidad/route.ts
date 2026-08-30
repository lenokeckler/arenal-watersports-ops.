import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/app/services";
import { EXTRA_FORM_SCREEN } from "@/app/constants";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";
import { logServerError } from "@/app/utils/logging/logServerError";

export interface ExtraCompatibilityRequestBody {
  unitId: string;
}

export type ExtraCompatibilityResponseData = Record<
  string,
  never
>;

interface RouteParams {
  params: Promise<{ extraId: string }>;
}

const isValidBody = (
  body: unknown
): body is ExtraCompatibilityRequestBody => {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const { unitId } = body as Record<string, unknown>;
  return (
    typeof unitId === "string" && unitId.trim().length > 0
  );
};

/**
 * `POST` grants and `DELETE` revokes one unit's compatibility with one extra
 * (US-ADM-020). Granting could run as the admin's own authenticated client
 * (`extra_compat_insert` already allows `is_admin()`), but revoking cannot:
 * `DELETE` is globally revoked for the `authenticated` role (section
 * "Defensa en profundidad", `rls_identity_catalog.sql`) — the same reason
 * worker permission revocation needs the service role — so both actions
 * share this route the same way `/permisos` does.
 */
const handleCompatibilityChange = async (
  request: Request,
  { params }: RouteParams,
  applyChange: (
    serviceRoleClient: ReturnType<
      typeof createServiceRoleSupabaseClient
    >,
    extraId: string,
    unitId: string
  ) => Promise<{ code?: string } | null>
): Promise<
  NextResponse<
    | SuccessResponse<ExtraCompatibilityResponseData>
    | ErrorResponse
  >
> => {
  const { extraId } = await params;

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

  const serverClient = await createServerSupabaseClient();
  const {
    data: { user: caller },
  } = await serverClient.auth.getUser();

  if (!caller) {
    return Response.unauthorized("Sesión no válida.");
  }

  const serviceRoleClient =
    createServiceRoleSupabaseClient();
  const { isAdmin } = await fetchWorkerPermissionState(
    serviceRoleClient,
    caller.id
  );

  if (!isAdmin) {
    return Response.forbidden(
      "No tiene permiso para modificar la compatibilidad de extras."
    );
  }

  try {
    const error = await applyChange(
      serviceRoleClient,
      extraId,
      body.unitId
    );

    if (error) {
      return Response.internalError(
        EXTRA_FORM_SCREEN.ERROR.GENERIC
      );
    }

    return Response.success<ExtraCompatibilityResponseData>(
      {}
    );
  } catch (error) {
    logServerError(error);
    return Response.internalError(
      EXTRA_FORM_SCREEN.ERROR.GENERIC
    );
  }
};

export const POST = (
  request: Request,
  routeParams: RouteParams
): ReturnType<typeof handleCompatibilityChange> =>
  handleCompatibilityChange(
    request,
    routeParams,
    async (serviceRoleClient, extraId, unitId) => {
      const { error } = await serviceRoleClient
        .from("extra_compatibility")
        .insert({ extra_id: extraId, unit_id: unitId });
      return error;
    }
  );

export const DELETE = (
  request: Request,
  routeParams: RouteParams
): ReturnType<typeof handleCompatibilityChange> =>
  handleCompatibilityChange(
    request,
    routeParams,
    async (serviceRoleClient, extraId, unitId) => {
      const { error } = await serviceRoleClient
        .from("extra_compatibility")
        .delete()
        .eq("extra_id", extraId)
        .eq("unit_id", unitId);
      return error;
    }
  );
