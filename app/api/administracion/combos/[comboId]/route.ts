import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/app/services";
import { COMBO_FORM_SCREEN } from "@/app/constants";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";
import { comboHasRecords } from "@/app/utils/administracion/combos";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { logServerError } from "@/app/utils/logging/logServerError";

interface RouteParams {
  params: Promise<{ comboId: string }>;
}

export type DeleteComboResponseData = Record<string, never>;

/**
 * `DELETE /api/administracion/combos/[comboId]` (US-ADM-022): the only
 * combos write that needs a server route — insert and update already go
 * through the admin's own authenticated client (`combos_insert` /
 * `combos_update` allow it), but `DELETE` is revoked for `authenticated` at
 * the database level (section "Defensa en profundidad",
 * `rls_identity_catalog.sql`), the same reason category and extra deletion
 * need the service role. `combo_items` is removed first: it references
 * `combos (id) on delete restrict`, so the combo itself cannot go while any
 * item still points at it.
 */
export const DELETE = async (
  request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    SuccessResponse<DeleteComboResponseData> | ErrorResponse
  >
> => {
  const { comboId } = await params;

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
      "No tiene permiso para eliminar combos."
    );
  }

  try {
    const hasRecords = await comboHasRecords(
      serviceRoleClient,
      comboId
    );

    if (hasRecords) {
      return Response.conflict(
        COMBO_FORM_SCREEN.DELETE.CONFIRM
      );
    }

    const { error: itemsError } = await serviceRoleClient
      .from("combo_items")
      .delete()
      .eq("combo_id", comboId);
    throwIfSupabaseError(itemsError, "combos.delete.items");

    const { error } = await serviceRoleClient
      .from("combos")
      .delete()
      .eq("id", comboId);
    throwIfSupabaseError(error, "combos.delete.combo");

    return Response.success<DeleteComboResponseData>({});
  } catch (error) {
    logServerError(error);
    return Response.internalError(
      COMBO_FORM_SCREEN.ERROR.GENERIC
    );
  }
};
