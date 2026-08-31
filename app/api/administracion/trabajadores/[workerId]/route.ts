import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/app/services";
import { WORK_AREA, WORKER_STATUS } from "@/app/constants";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";
import { generateTemporaryPassword } from "@/app/utils/generators/temporaryPassword";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { logServerError } from "@/app/utils/logging/logServerError";

const GENERIC_ERROR =
  "No se pudo dar de baja al trabajador.";

/** Cien anos. Recontratar lo levanta; mientras tanto, no se entra. */
const RETIRED_BAN_DURATION = "876000h";

export type DeleteWorkerResponseData = Record<
  string,
  never
>;

interface RouteParams {
  params: Promise<{ workerId: string }>;
}

/**
 * `DELETE /api/administracion/trabajadores/[workerId]`: se dio de baja a la
 * persona. Pierde el acceso y sale del panel, pero su cuenta se guarda
 * entera por si vuelve.
 *
 * No borra nada de la ficha a proposito. Si la recontratan tiene que poder
 * entrar con la misma cuenta que tenia, con sus mismas areas y marcas, asi
 * que el correo, la cedula, el nombre de usuario y los permisos se quedan
 * donde estan. Lo unico que se corta es el acceso:
 *
 * 1. La cuenta de `auth.users` se banea y se le pone una contrasena
 *    aleatoria que nadie conoce. No se borra porque no se puede —
 *    `workers.id` la referencia con `on delete restrict` — pero tampoco
 *    hace falta: asi no se entra ni con la clave vieja.
 * 2. `deleted_at` la saca de todas las listas del panel; queda solo bajo el
 *    filtro de ex trabajadores.
 * 3. Los PIN de recuperacion pendientes se borran: uno vivo dejaria
 *    recuperar la cuenta de alguien que ya no trabaja aqui.
 *
 * El historial no se toca en ningun caso: sigue firmando con su nombre
 * (RNF-023).
 *
 * `DELETE` sigue revocado para `authenticated` a nivel de base, asi que esto
 * va con service role, igual que la creacion.
 */
export const DELETE = async (
  _request: Request,
  { params }: RouteParams
): Promise<
  NextResponse<
    | SuccessResponse<DeleteWorkerResponseData>
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
      "No tiene permiso para dar de baja trabajadores."
    );
  }

  if (workerId === caller.id) {
    return Response.forbidden(
      "No puede darse de baja a sí mismo."
    );
  }

  try {
    const { data: worker, error: workerError } =
      await serviceRoleClient
        .from("workers")
        .select("id, base_role, deleted_at")
        .eq("id", workerId)
        .maybeSingle();
    throwIfSupabaseError(
      workerError,
      "administracion.darDeBaja.fetchWorker"
    );

    if (!worker || worker.deleted_at) {
      return Response.notFound("Trabajador no encontrado.");
    }

    // El disparador `workers_guard_admin` tambien lo impide; esto solo
    // devuelve un mensaje entendible en vez de un error de base.
    if (worker.base_role === WORK_AREA.ADMINISTRATION) {
      return Response.forbidden(
        "La cuenta de administración no se da de baja."
      );
    }

    const { error: pinsError } = await serviceRoleClient
      .from("password_reset_pins")
      .delete()
      .eq("worker_id", workerId);
    throwIfSupabaseError(
      pinsError,
      "administracion.darDeBaja.pins"
    );

    // Los datos personales se van antes que la cuenta: si la fila no se
    // puede limpiar, la persona sigue teniendo su cuenta y el
    // administrador lo vuelve a intentar. Al reves quedaria una cuenta
    // borrada con la cedula y el correo todavia guardados.
    const { error: updateError } = await serviceRoleClient
      .from("workers")
      .update({
        deleted_at: new Date().toISOString(),
        status: WORKER_STATUS.BLOCKED,
        updated_by: caller.id,
      })
      .eq("id", workerId);
    throwIfSupabaseError(
      updateError,
      "administracion.darDeBaja.update"
    );

    const { error: authError } =
      await serviceRoleClient.auth.admin.updateUserById(
        workerId,
        {
          ban_duration: RETIRED_BAN_DURATION,
          password: generateTemporaryPassword(),
        }
      );

    if (authError) {
      // Si esto falla la persona todavia podria entrar, asi que no se
      // puede quedar en un mensaje generico: hay que poder ver por que.
      logServerError(authError);
      return Response.internalError(GENERIC_ERROR);
    }

    return Response.success<DeleteWorkerResponseData>({});
  } catch (error) {
    logServerError(error);
    return Response.internalError(GENERIC_ERROR);
  }
};
