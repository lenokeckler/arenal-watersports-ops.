import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/app/services";
import { CATEGORY_FORM_SCREEN } from "@/app/constants";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";
import { categoryHasRecords } from "@/app/utils/administracion/categories";

interface RouteParams {
  params: Promise<{ categoryId: string }>;
}

export type DeleteCategoryResponseData = Record<
  string,
  never
>;

/**
 * `DELETE /api/administracion/categorias/[categoryId]` (US-ADM-012,
 * validaciones): the only category write that needs a server route —
 * insert and update already go through the admin's own authenticated
 * client (`categories_insert` / `categories_update` allow it), but `DELETE`
 * is revoked for `authenticated` at the database level (section "Defensa en
 * profundidad", `rls_identity_catalog.sql`), the same reason worker
 * permission revocation needs the service role. Re-checks
 * `categoryHasRecords` server-side instead of trusting the client's own
 * read of it, since a unit or a stock row could have appeared in the gap
 * between the edit screen loading and this request.
 */
export const DELETE = async (
  request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    | SuccessResponse<DeleteCategoryResponseData>
    | ErrorResponse
  >
> => {
  const { categoryId } = await params;

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
      "No tiene permiso para eliminar categorías."
    );
  }

  const hasRecords = await categoryHasRecords(
    serviceRoleClient,
    categoryId
  );

  if (hasRecords) {
    return Response.conflict(
      CATEGORY_FORM_SCREEN.DEACTIVATE.CONFIRM
    );
  }

  const { error } = await serviceRoleClient
    .from("equipment_categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    return Response.internalError(
      CATEGORY_FORM_SCREEN.ERROR.GENERIC
    );
  }

  return Response.success<DeleteCategoryResponseData>({});
};
