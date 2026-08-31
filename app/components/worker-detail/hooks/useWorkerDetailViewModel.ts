"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  API,
  PERMISSION_KIND,
  PATHS,
  STRING,
  WORK_AREA,
  WORKER_DETAIL_SCREEN,
  WORKER_FORM_SCREEN,
  WORKER_STATUS,
  type ApiMethod,
  type WorkArea,
  type WorkerMark,
  type WorkerStatus,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import type { RehireWorkerResponseData } from "@/app/api/administracion/trabajadores/[workerId]/recontratar/route";
import type { WorkerPermissionRequestBody } from "@/app/api/administracion/trabajadores/[workerId]/permisos/route";
import type { ResetWorkerPasswordResponseData } from "@/app/api/administracion/trabajadores/[workerId]/contrasena-temporal/route";
import type { WorkerDetailProps } from "../models/WorkerDetailProps.interface";
import type { WorkerDetailViewModel } from "../models/WorkerDetailViewModel.interface";

const ALL_AREAS: readonly WorkArea[] =
  Object.values(WORK_AREA);

const postJson = async <T>(
  route: string,
  method: ApiMethod,
  body: unknown
): Promise<{ data?: T; error?: string; ok: boolean }> => {
  try {
    const response = await fetch(route, {
      body: JSON.stringify(body),
      headers: {
        [API.HEADERS.CONTENT_TYPE]: API.HEADERS.JSON,
      },
      method,
    });
    const responseBody = (await response
      .json()
      .catch(() => null)) as
      (T & { error?: string }) | null;

    if (!response.ok) {
      return {
        error:
          responseBody?.error ??
          WORKER_DETAIL_SCREEN.ERROR.ACTION_FAILED,
        ok: false,
      };
    }

    return { data: responseBody ?? undefined, ok: true };
  } catch {
    return {
      error: WORKER_DETAIL_SCREEN.ERROR.ACTION_FAILED,
      ok: false,
    };
  }
};

/**
 * All the logic behind `WorkerDetail` (US-ADM-002 through US-ADM-010).
 * Areas and marks go through `/permisos` (service role, since revoking one
 * needs a `DELETE` the `authenticated` role does not have); status and
 * expiry are plain `workers` updates the admin's own authenticated client
 * can make directly — `workers_update_admin` already allows it, and the
 * single administration account's own guard trigger is what actually stops
 * it from being blocked, not a client-side check duplicating that rule.
 */
export const useWorkerDetailViewModel = ({
  worker: initialWorker,
}: WorkerDetailProps): WorkerDetailViewModel => {
  const router = useRouter();
  const [worker, setWorker] = useState(initialWorker);
  const [status, setStatus] = useState<WorkerStatus>(
    initialWorker.status
  );
  const [expiresAtDraft, setExpiresAtDraft] =
    useState<string>(
      initialWorker.expiresAt?.slice(0, 10) ?? STRING.Empty
    );
  const [actionError, setActionError] =
    useState<Nullable<string>>(null);
  const [resetPasswordResult, setResetPasswordResult] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  /**
   * El panel de contrasena temporal lo abren dos acciones distintas —
   * reponerla y recontratar— y su titulo tiene que decir cual fue. No se
   * puede deducir del estado del trabajador: recontratar ya lo dejo activo
   * para cuando el panel aparece.
   */
  const [passwordPanelTitle, setPasswordPanelTitle] =
    useState<string>(
      WORKER_FORM_SCREEN.SUCCESS.RESET_TITLE
    );

  const isAdminAccount =
    worker.baseRole === WORK_AREA.ADMINISTRATION;
  const availableAreas = ALL_AREAS.filter(
    (area) =>
      area !== worker.baseRole &&
      !worker.additionalAreas.includes(area)
  );

  const changePermission = async (
    method: ApiMethod,
    body: WorkerPermissionRequestBody
  ): Promise<boolean> => {
    setIsBusy(true);
    setActionError(null);

    const result = await postJson(
      API.ROUTES.WORKER_PERMISSIONS(worker.id),
      method,
      body
    );

    setIsBusy(false);
    if (!result.ok) {
      setActionError(
        result.error ??
          WORKER_DETAIL_SCREEN.ERROR.ACTION_FAILED
      );
    }
    return result.ok;
  };

  const handleAddArea = (area: WorkArea): void => {
    void changePermission(API.METHODS.POST, {
      kind: PERMISSION_KIND.AREA,
      value: area,
    }).then((ok) => {
      if (ok) {
        setWorker((current) => ({
          ...current,
          additionalAreas: [
            ...current.additionalAreas,
            area,
          ],
        }));
      }
    });
  };

  const handleRemoveArea = (area: WorkArea): void => {
    void changePermission(API.METHODS.DELETE, {
      kind: PERMISSION_KIND.AREA,
      value: area,
    }).then((ok) => {
      if (ok) {
        setWorker((current) => ({
          ...current,
          additionalAreas: current.additionalAreas.filter(
            (existing) => existing !== area
          ),
        }));
      }
    });
  };

  const handleToggleMark = (
    mark: WorkerMark,
    isGranted: boolean
  ): void => {
    void changePermission(
      isGranted ? API.METHODS.DELETE : API.METHODS.POST,
      { kind: PERMISSION_KIND.MARK, value: mark }
    ).then((ok) => {
      if (ok) {
        setWorker((current) => ({
          ...current,
          marks: isGranted
            ? current.marks.filter(
                (existing) => existing !== mark
              )
            : [...current.marks, mark],
        }));
      }
    });
  };

  const updateStatus = async (
    nextStatus: WorkerStatus
  ): Promise<void> => {
    setIsBusy(true);
    setActionError(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("workers")
      .update({
        status: nextStatus,
        ...(nextStatus === WORKER_STATUS.ACTIVE
          ? { failed_attempts: 0 }
          : {}),
      })
      .eq("id", worker.id);

    setIsBusy(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setStatus(nextStatus);
  };

  const handleBlock = (): void => {
    void updateStatus(WORKER_STATUS.BLOCKED);
  };

  const handleReactivate = (): void => {
    void updateStatus(WORKER_STATUS.ACTIVE);
  };

  const handleExpiresAtDraftChange = (
    value: string
  ): void => {
    setExpiresAtDraft(value);
  };

  const handleExtendExpiry = (): void => {
    if (!expiresAtDraft) {
      setActionError(
        WORKER_DETAIL_SCREEN.ERROR.EXPIRY_REQUIRED
      );
      return;
    }

    setIsBusy(true);
    setActionError(null);

    const supabase = createBrowserSupabaseClient();
    void supabase
      .from("workers")
      .update({
        expires_at: new Date(expiresAtDraft).toISOString(),
      })
      .eq("id", worker.id)
      .then(({ error }) => {
        setIsBusy(false);
        if (error) {
          setActionError(error.message);
          return;
        }
        setWorker((current) => ({
          ...current,
          expiresAt: new Date(expiresAtDraft).toISOString(),
        }));
      });
  };

  const [isConfirmingDelete, setIsConfirmingDelete] =
    useState<boolean>(false);

  const handleRequestDelete = (): void => {
    setActionError(null);
    setIsConfirmingDelete(true);
  };

  const handleCancelDelete = (): void => {
    setIsConfirmingDelete(false);
  };

  /**
   * La persona dejo de trabajar aqui. El perfil se va; lo que hizo se
   * queda. Al terminar se vuelve a la lista, porque esta ficha ya no
   * existe: `fetchWorkerDetail` filtra los perfiles eliminados.
   */
  /**
   * La persona volvio. Vuelve a su misma cuenta, con sus mismas areas y
   * marcas: lo unico que cambia es que recupera el acceso, con una
   * contrasena temporal nueva. Se reutiliza el mismo panel que muestra la
   * contrasena tras reponerla, porque es exactamente la misma entrega.
   */
  const handleRehire = (): void => {
    setIsBusy(true);
    setActionError(null);
    setResetPasswordResult(null);

    void postJson<RehireWorkerResponseData>(
      API.ROUTES.WORKER_REHIRE(worker.id),
      API.METHODS.POST,
      {}
    ).then((result) => {
      setIsBusy(false);
      if (!result.ok || !result.data) {
        setActionError(
          result.error ??
            WORKER_DETAIL_SCREEN.ERROR.ACTION_FAILED
        );
        return;
      }
      setWorker((current) => ({
        ...current,
        deletedAt: null,
      }));
      setStatus(WORKER_STATUS.ACTIVE);
      setPasswordPanelTitle(
        WORKER_FORM_SCREEN.SUCCESS.REHIRE_TITLE
      );
      setResetPasswordResult(result.data.temporaryPassword);
    });
  };

  const handleConfirmDelete = (): void => {
    setIsBusy(true);
    setActionError(null);

    void postJson<Record<string, never>>(
      API.ROUTES.WORKER_DETAIL(worker.id),
      API.METHODS.DELETE,
      {}
    ).then((result) => {
      if (!result.ok) {
        setIsBusy(false);
        setIsConfirmingDelete(false);
        setActionError(
          result.error ??
            WORKER_DETAIL_SCREEN.ERROR.ACTION_FAILED
        );
        return;
      }
      router.replace(PATHS.ADMIN.WORKERS);
    });
  };

  const handleResetPassword = (): void => {
    setIsBusy(true);
    setActionError(null);
    setResetPasswordResult(null);

    void postJson<ResetWorkerPasswordResponseData>(
      API.ROUTES.WORKER_TEMPORARY_PASSWORD(worker.id),
      API.METHODS.POST,
      {}
    ).then((result) => {
      setIsBusy(false);
      if (!result.ok || !result.data) {
        setActionError(
          result.error ??
            WORKER_DETAIL_SCREEN.ERROR.ACTION_FAILED
        );
        return;
      }
      setPasswordPanelTitle(
        WORKER_FORM_SCREEN.SUCCESS.RESET_TITLE
      );
      setResetPasswordResult(result.data.temporaryPassword);
    });
  };

  return {
    actionError,
    availableAreas,
    expiresAtDraft,
    handleAddArea,
    handleBlock,
    handleCancelDelete,
    handleConfirmDelete,
    handleExpiresAtDraftChange,
    handleExtendExpiry,
    handleReactivate,
    handleRemoveArea,
    handleRehire,
    handleRequestDelete,
    handleResetPassword,
    handleToggleMark,
    isAdminAccount,
    isBusy,
    isConfirmingDelete,
    passwordPanelTitle,
    resetPasswordResult,
    status,
    worker,
  };
};
