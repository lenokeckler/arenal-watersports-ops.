import type { NextResponse } from "next/server";
import type { SuccessResponse } from "@/app/utils/response/models/SuccessResponse.interface";
import type { ErrorResponse } from "@/app/utils/response/models/ErrorResponse.interface";
import Response from "@/app/utils/response/Response";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/app/services";
import {
  PERMISSION_KIND,
  WORK_AREA,
  WORKER_MARK,
  type PermissionKind,
  type WorkArea,
  type WorkerMark,
} from "@/app/constants";
import { fetchWorkerPermissionState } from "@/app/utils/administracion/workerPermissions";

export interface WorkerPermissionRequestBody {
  kind: PermissionKind;
  value: WorkArea | WorkerMark;
}

export type WorkerPermissionResponseData = Record<string, never>;

interface RouteParams {
  params: Promise<{ workerId: string }>;
}

const VALID_AREAS: readonly WorkArea[] = Object.values(WORK_AREA);
const VALID_MARKS: readonly WorkerMark[] = Object.values(WORKER_MARK);

const isValidBody = (
  body: unknown
): body is WorkerPermissionRequestBody => {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const { kind, value } = body as Record<string, unknown>;

  if (kind === PERMISSION_KIND.AREA) {
    return typeof value === "string" && VALID_AREAS.includes(value as WorkArea);
  }
  if (kind === PERMISSION_KIND.MARK) {
    return typeof value === "string" && VALID_MARKS.includes(value as WorkerMark);
  }
  return false;
};

/**
 * `POST` grants and `DELETE` revokes one area or one mark on a worker
 * (US-ADM-002 through US-ADM-005). Granting could run as the admin's own
 * authenticated client (`worker_areas_insert` / `worker_marks_insert`
 * already allow `is_admin()`), but revoking cannot: `DELETE` is globally
 * revoked for the `authenticated` role (section "Defensa en profundidad",
 * `rls_identity_catalog.sql`), on purpose, so only the service role can
 * remove a row here — both actions share this route so grant and revoke
 * follow the same permission check instead of two.
 */
const handlePermissionChange = async (
  request: Request,
  { params }: RouteParams,
  applyChange: (
    serviceRoleClient: ReturnType<typeof createServiceRoleSupabaseClient>,
    workerId: string,
    body: WorkerPermissionRequestBody,
    grantedBy: string
  ) => Promise<{ code?: string } | null>
): Promise<
  NextResponse<SuccessResponse<WorkerPermissionResponseData> | ErrorResponse>
> => {
  const { workerId } = await params;

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
  const { isAdmin } = await fetchWorkerPermissionState(
    serviceRoleClient,
    caller.id
  );

  if (!isAdmin) {
    return Response.forbidden(
      "No tiene permiso para modificar áreas o marcas."
    );
  }

  if (body.kind === PERMISSION_KIND.AREA) {
    const { data: worker } = await serviceRoleClient
      .from("workers")
      .select("base_role")
      .eq("id", workerId)
      .maybeSingle();

    if (worker?.base_role === body.value) {
      return Response.badRequest(
        "El rol base no se administra como área adicional."
      );
    }
  }

  const error = await applyChange(
    serviceRoleClient,
    workerId,
    body,
    caller.id
  );

  if (error) {
    return Response.internalError(
      "No se pudo completar la operación."
    );
  }

  return Response.success<WorkerPermissionResponseData>({});
};

export const POST = (
  request: Request,
  routeParams: RouteParams
): ReturnType<typeof handlePermissionChange> =>
  handlePermissionChange(
    request,
    routeParams,
    async (serviceRoleClient, workerId, body, grantedBy) => {
      const { error } =
        body.kind === PERMISSION_KIND.AREA
          ? await serviceRoleClient.from("worker_areas").insert({
              area: body.value as WorkArea,
              granted_by: grantedBy,
              worker_id: workerId,
            })
          : await serviceRoleClient.from("worker_marks").insert({
              granted_by: grantedBy,
              mark: body.value as WorkerMark,
              worker_id: workerId,
            });
      return error;
    }
  );

export const DELETE = (
  request: Request,
  routeParams: RouteParams
): ReturnType<typeof handlePermissionChange> =>
  handlePermissionChange(
    request,
    routeParams,
    async (serviceRoleClient, workerId, body) => {
      const { error } =
        body.kind === PERMISSION_KIND.AREA
          ? await serviceRoleClient
              .from("worker_areas")
              .delete()
              .eq("worker_id", workerId)
              .eq("area", body.value as WorkArea)
          : await serviceRoleClient
              .from("worker_marks")
              .delete()
              .eq("worker_id", workerId)
              .eq("mark", body.value as WorkerMark);
      return error;
    }
  );
