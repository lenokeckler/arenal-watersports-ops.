import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/app/services";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";
import { generateTemporaryPassword } from "@/app/utils/generators/temporaryPassword";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { logServerError } from "@/app/utils/logging/logServerError";

const GENERIC_ERROR =
  "No se pudo generar la contraseña temporal.";

export interface ResetWorkerPasswordResponseData {
  temporaryPassword: string;
}

interface RouteParams {
  params: Promise<{ workerId: string }>;
}

/**
 * `POST /api/administracion/trabajadores/[workerId]/contrasena-temporal`
 * (US-ADM-007): a fresh single-use password for a worker who lost theirs
 * and has no personal email on file. Only administración issues it — the
 * database also raises `workers_update_admin` for a direct table write,
 * but the password itself lives in `auth.users`, so this still needs the
 * service role the same way worker creation does.
 */
export const POST = async (
  _request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    | SuccessResponse<ResetWorkerPasswordResponseData>
    | ErrorResponse
  >
> => {
  const { workerId } = await params;

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
      "No tiene permiso para generar contraseñas temporales."
    );
  }

  try {
    const { data: worker, error: workerError } =
      await serviceRoleClient
        .from("workers")
        .select("id")
        .eq("id", workerId)
        .maybeSingle();
    throwIfSupabaseError(
      workerError,
      "administracion.contrasenaTemporal.fetchWorker"
    );

    if (!worker) {
      return Response.notFound("Trabajador no encontrado.");
    }

    const temporaryPassword = generateTemporaryPassword();

    const { error: authError } =
      await serviceRoleClient.auth.admin.updateUserById(
        workerId,
        {
          password: temporaryPassword,
        }
      );

    if (authError) {
      return Response.internalError(GENERIC_ERROR);
    }

    await serviceRoleClient
      .from("workers")
      .update({
        must_change_password: true,
        updated_by: caller.id,
      })
      .eq("id", workerId);

    return Response.success<ResetWorkerPasswordResponseData>(
      {
        temporaryPassword,
      }
    );
  } catch (error) {
    // A Supabase failure here must not read as "worker not found" — it
    // fails closed and visibly (a 500 logged server-side) instead of
    // closed and silent.
    logServerError(error);
    return Response.internalError(GENERIC_ERROR);
  }
};
