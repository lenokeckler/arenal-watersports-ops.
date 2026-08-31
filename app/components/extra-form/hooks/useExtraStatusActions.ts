"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  API,
  CATEGORY_STATUS,
  EXTRA_FORM_SCREEN,
  PATHS,
  type CategoryStatus,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";

interface UseExtraStatusActionsReturn {
  actionError: Nullable<string>;
  handleDeactivate: () => void;
  handleDelete: () => void;
  handleReactivate: () => void;
  isBusy: boolean;
  status: CategoryStatus;
}

/**
 * US-ADM-019 (criterio de aceptación): an extra that never appeared on a
 * reservation is deleted outright; one that already has records is only
 * ever marked inactive, and can be reactivated later — the same shape
 * `useCategoryStatusActions` follows for categories.
 */
export const useExtraStatusActions = (
  extraId: Nullable<string>,
  adminWorkerId: string,
  initialStatus: CategoryStatus
): UseExtraStatusActionsReturn => {
  const router = useRouter();
  const [status, setStatus] = useState<CategoryStatus>(initialStatus);
  const [actionError, setActionError] = useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const updateStatus = async (
    nextStatus: CategoryStatus
  ): Promise<void> => {
    if (!extraId) {
      return;
    }

    setIsBusy(true);
    setActionError(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("extras")
      .update({ status: nextStatus, updated_by: adminWorkerId })
      .eq("id", extraId);

    setIsBusy(false);

    if (error) {
      setActionError(EXTRA_FORM_SCREEN.ERROR.GENERIC);
      return;
    }

    setStatus(nextStatus);
  };

  const handleDeactivate = (): void => {
    if (!window.confirm(EXTRA_FORM_SCREEN.DEACTIVATE.CONFIRM)) {
      return;
    }
    void updateStatus(CATEGORY_STATUS.INACTIVE);
  };

  const handleReactivate = (): void => {
    void updateStatus(CATEGORY_STATUS.ACTIVE);
  };

  const handleDelete = (): void => {
    if (!extraId || !window.confirm(EXTRA_FORM_SCREEN.DELETE.CONFIRM)) {
      return;
    }

    setIsBusy(true);
    setActionError(null);

    void fetch(API.ROUTES.EXTRA(extraId), {
      method: API.METHODS.DELETE,
    }).then((response) => {
      setIsBusy(false);

      if (!response.ok) {
        setActionError(EXTRA_FORM_SCREEN.ERROR.GENERIC);
        return;
      }

      router.replace(PATHS.ADMIN.EXTRAS);
    });
  };

  return {
    actionError,
    handleDeactivate,
    handleDelete,
    handleReactivate,
    isBusy,
    status,
  };
};
