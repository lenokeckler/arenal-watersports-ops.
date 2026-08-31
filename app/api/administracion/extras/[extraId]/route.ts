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
import { extraHasRecords } from "@/app/utils/administracion/extras";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { logServerError } from "@/app/utils/logging/logServerError";

interface RouteParams {
  params: Promise<{ extraId: string }>;
}

export type DeleteExtraResponseData = Record<string, never>;

/**
 * `DELETE /api/administracion/extras/[extraId]` (US-ADM-019): the only
 * extras write that needs a server route — insert and update already go
 * through the admin's own authenticated client (`extras_insert` /
 * `extras_update` allow it), but `DELETE` is revoked for `authenticated` at
 * the database level (section "Defensa en profundidad",
 * `rls_identity_catalog.sql`), the same reason category deletion needs the
 * service role. Compatibility rows are removed first: `extra_compatibility`
 * references `extras (id) on delete restrict`, so the extra itself cannot
 * go while any of those rows still point at it.
 */
export const DELETE = async (
  request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    SuccessResponse<DeleteExtraResponseData> | ErrorResponse
  >
> => {
  const { extraId } = await params;

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
      "No tiene permiso para eliminar extras."
    );
  }

  try {
    const hasRecords = await extraHasRecords(
      serviceRoleClient,
      extraId
    );

    if (hasRecords) {
      return Response.conflict(
        EXTRA_FORM_SCREEN.DELETE.CONFIRM
      );
    }

    const { error: compatibilityError } =
      await serviceRoleClient
        .from("extra_compatibility")
        .delete()
        .eq("extra_id", extraId);
    throwIfSupabaseError(
      compatibilityError,
      "extras.delete.compatibility"
    );

    const { error } = await serviceRoleClient
      .from("extras")
      .delete()
      .eq("id", extraId);
    throwIfSupabaseError(error, "extras.delete.extra");

    return Response.success<DeleteExtraResponseData>({});
  } catch (error) {
    logServerError(error);
    return Response.internalError(
      EXTRA_FORM_SCREEN.ERROR.GENERIC
    );
  }
};
