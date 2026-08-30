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
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { logServerError } from "@/app/utils/logging/logServerError";

export interface ComboItemDeleteRequestBody {
  categoryId: string;
}

export type ComboItemDeleteResponseData = Record<
  string,
  never
>;

interface RouteParams {
  params: Promise<{ comboId: string }>;
}

const isValidBody = (
  body: unknown
): body is ComboItemDeleteRequestBody => {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const { categoryId } = body as Record<string, unknown>;
  return (
    typeof categoryId === "string" &&
    categoryId.trim().length > 0
  );
};

/**
 * `DELETE /api/administracion/combos/[comboId]/items` (US-ADM-022): removes
 * one category from a combo's package. Adding an item and changing its
 * quantity already go through the admin's own authenticated client
 * (`combo_items_insert`/`_update` allow it), but `DELETE` is revoked for
 * `authenticated` at the database level, the same reason extra
 * compatibility revocation needs the service role.
 */
export const DELETE = async (
  request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    | SuccessResponse<ComboItemDeleteResponseData>
    | ErrorResponse
  >
> => {
  const { comboId } = await params;

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
      "No tiene permiso para modificar los equipos del combo."
    );
  }

  try {
    const { error } = await serviceRoleClient
      .from("combo_items")
      .delete()
      .eq("combo_id", comboId)
      .eq("category_id", body.categoryId);
    throwIfSupabaseError(error, "combos.items.delete");

    return Response.success<ComboItemDeleteResponseData>(
      {}
    );
  } catch (error) {
    logServerError(error);
    return Response.internalError(
      COMBO_FORM_SCREEN.ERROR.GENERIC
    );
  }
};
