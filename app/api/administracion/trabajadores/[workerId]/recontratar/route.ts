import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/app/services";
import { WORKER_STATUS } from "@/app/constants";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";
import { generateTemporaryPassword } from "@/app/utils/generators/temporaryPassword";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { logServerError } from "@/app/utils/logging/logServerError";

const GENERIC_ERROR =
  "No se pudo recontratar al trabajador.";

/** Supabase pide una duracion; "none" es como se levanta un baneo. */
const NO_BAN = "none";

export interface RehireWorkerResponseData {
  temporaryPassword: string;
}

interface RouteParams {
  params: Promise<{ workerId: string }>;
}

/**
 * `POST /api/administracion/trabajadores/[workerId]/recontratar`: la persona
 * volvio, y vuelve a su misma cuenta.
 *
 * Es lo contrario exacto de la baja, y por eso no toca la ficha: sus areas y
 * sus marcas siguen ahi desde el dia que se fue, que es lo que hace que
 * "usar la misma cuenta" signifique algo. Lo unico que se devuelve es el
 * acceso — se levanta el baneo y se entrega una contrasena temporal nueva,
 * porque nadie deberia volver a entrar con la clave que tenia el dia que lo
 * despidieron.
 *
 * Si volvio a otro puesto, administracion le cambia areas y marcas en la
 * ficha como con cualquier otra cuenta.
 */
export const POST = async (
  _request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    | SuccessResponse<RehireWorkerResponseData>
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
      "No tiene permiso para recontratar trabajadores."
    );
  }

  try {
    const { data: worker, error: workerError } =
      await serviceRoleClient
        .from("workers")
        .select("id, deleted_at")
        .eq("id", workerId)
        .maybeSingle();
    throwIfSupabaseError(
      workerError,
      "administracion.recontratar.fetchWorker"
    );

    if (!worker) {
      return Response.notFound("Trabajador no encontrado.");
    }

    if (!worker.deleted_at) {
      return Response.badRequest(
        "Esa cuenta no está dada de baja."
      );
    }

    const temporaryPassword = generateTemporaryPassword();

    const { error: authError } =
      await serviceRoleClient.auth.admin.updateUserById(
        workerId,
        {
          ban_duration: NO_BAN,
          password: temporaryPassword,
        }
      );

    if (authError) {
      logServerError(authError);
      return Response.internalError(GENERIC_ERROR);
    }

    // El acceso se devuelve primero y la ficha despues: si esto fallara,
    // la cuenta seguiria fuera del panel y administracion lo reintenta.
    // Al reves quedaria una persona listada como activa que no puede
    // entrar, y nadie sabria por que.
    const { error: updateError } = await serviceRoleClient
      .from("workers")
      .update({
        deleted_at: null,
        failed_attempts: 0,
        must_change_password: true,
        status: WORKER_STATUS.ACTIVE,
        updated_by: caller.id,
      })
      .eq("id", workerId);
    throwIfSupabaseError(
      updateError,
      "administracion.recontratar.update"
    );

    return Response.success<RehireWorkerResponseData>({
      temporaryPassword,
    });
  } catch (error) {
    logServerError(error);
    return Response.internalError(GENERIC_ERROR);
  }
};
