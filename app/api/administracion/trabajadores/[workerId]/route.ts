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
  WORKER_STATUS,
} from "@/app/constants";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";
import {
  buildRetiredEmail,
  buildRetiredUsername,
} from "@/app/utils/administracion/retiredWorker";
import { generateTemporaryPassword } from "@/app/utils/generators/temporaryPassword";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { logServerError } from "@/app/utils/logging/logServerError";

const GENERIC_ERROR = "No se pudo eliminar el trabajador.";

/** Cien anos: la cuenta no vuelve, y Supabase exige una duracion. */
const RETIRED_BAN_DURATION = "876000h";

export type DeleteWorkerResponseData = Record<
  string,
  never
>;

interface RouteParams {
  params: Promise<{ workerId: string }>;
}

/**
 * `DELETE /api/administracion/trabajadores/[workerId]`: la persona dejo de
 * trabajar aqui y su perfil deja de existir.
 *
 * No es un `delete` de la fila y no puede serlo: 36 llaves foraneas apuntan
 * a `workers` y casi todas son `no action`, asi que Postgres lo rechazaria
 * en cuanto la persona haya firmado cualquier cosa — y eso es exactamente lo
 * que hay que conservar. Lo que se elimina es todo lo que hace un perfil:
 *
 * 1. La cuenta de `auth.users` queda inutilizable. No se borra porque no se
 *    puede: `workers.id` la referencia con `on delete restrict`, y la fila
 *    de trabajador es justamente la que tiene que sobrevivir. Asi que se
 *    neutraliza — se le pone una contrasena aleatoria que nadie conoce, se
 *    banea, y se le cambia el correo sintetico para liberar el del nombre
 *    de usuario. El efecto es el mismo: no se vuelve a entrar con ella.
 * 2. Las areas y las marcas, para que no quede ningun permiso colgando.
 * 3. Los PIN de recuperacion pendientes.
 * 4. Los datos personales: correo, cedula, caducidad, ultimo modo. El
 *    nombre de usuario se libera tambien, porque es unico y alguien nuevo
 *    puede necesitarlo.
 *
 * Sobrevive el identificador y el nombre completo, que es lo unico que el
 * historial necesita para seguir diciendo quien hizo que (RNF-023).
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
      "No tiene permiso para eliminar trabajadores."
    );
  }

  if (workerId === caller.id) {
    return Response.forbidden(
      "No puede eliminar su propia cuenta."
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
      "administracion.eliminarTrabajador.fetchWorker"
    );

    if (!worker || worker.deleted_at) {
      return Response.notFound("Trabajador no encontrado.");
    }

    // El disparador `workers_guard_admin` tambien lo impide; esto solo
    // devuelve un mensaje entendible en vez de un error de base.
    if (worker.base_role === WORK_AREA.ADMINISTRATION) {
      return Response.forbidden(
        "La cuenta de administración no se elimina."
      );
    }

    const { error: areasError } = await serviceRoleClient
      .from("worker_areas")
      .delete()
      .eq("worker_id", workerId);
    throwIfSupabaseError(
      areasError,
      "administracion.eliminarTrabajador.areas"
    );

    const { error: marksError } = await serviceRoleClient
      .from("worker_marks")
      .delete()
      .eq("worker_id", workerId);
    throwIfSupabaseError(
      marksError,
      "administracion.eliminarTrabajador.marks"
    );

    const { error: pinsError } = await serviceRoleClient
      .from("password_reset_pins")
      .delete()
      .eq("worker_id", workerId);
    throwIfSupabaseError(
      pinsError,
      "administracion.eliminarTrabajador.pins"
    );

    // Los datos personales se van antes que la cuenta: si la fila no se
    // puede limpiar, la persona sigue teniendo su cuenta y el
    // administrador lo vuelve a intentar. Al reves quedaria una cuenta
    // borrada con la cedula y el correo todavia guardados.
    const { error: updateError } = await serviceRoleClient
      .from("workers")
      .update({
        deleted_at: new Date().toISOString(),
        expires_at: null,
        last_work_area: null,
        national_id: null,
        personal_email: null,
        status: WORKER_STATUS.BLOCKED,
        updated_by: caller.id,
        username: buildRetiredUsername(workerId),
      })
      .eq("id", workerId);
    throwIfSupabaseError(
      updateError,
      "administracion.eliminarTrabajador.update"
    );

    const { error: authError } =
      await serviceRoleClient.auth.admin.updateUserById(
        workerId,
        {
          ban_duration: RETIRED_BAN_DURATION,
          email: buildRetiredEmail(
            workerId,
            ACCESS_AUTH.SYNTHETIC_EMAIL_DOMAIN
          ),
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
