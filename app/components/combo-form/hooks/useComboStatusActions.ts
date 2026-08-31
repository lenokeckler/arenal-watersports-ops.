"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  API,
  CATEGORY_STATUS,
  COMBO_FORM_SCREEN,
  PATHS,
  type CategoryStatus,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";

interface UseComboStatusActionsReturn {
  actionError: Nullable<string>;
  handleDeactivate: () => void;
  handleDelete: () => void;
  handleReactivate: () => void;
  isBusy: boolean;
  status: CategoryStatus;
}

/**
 * US-ADM-022 (criterio de aceptación): a combo that never sold is deleted
 * outright; one that already sold is only ever marked inactive, and can be
 * reactivated later — the same shape `useCategoryStatusActions` and
 * `useExtraStatusActions` follow.
 */
export const useComboStatusActions = (
  comboId: Nullable<string>,
  adminWorkerId: string,
  initialStatus: CategoryStatus
): UseComboStatusActionsReturn => {
  const router = useRouter();
  const [status, setStatus] =
    useState<CategoryStatus>(initialStatus);
  const [actionError, setActionError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const updateStatus = async (
    nextStatus: CategoryStatus
  ): Promise<void> => {
    if (!comboId) {
      return;
    }

    setIsBusy(true);
    setActionError(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("combos")
      .update({
        status: nextStatus,
        updated_by: adminWorkerId,
      })
      .eq("id", comboId);

    setIsBusy(false);

    if (error) {
      setActionError(COMBO_FORM_SCREEN.ERROR.GENERIC);
      return;
    }

    setStatus(nextStatus);
  };

  const handleDeactivate = (): void => {
    if (
      !window.confirm(COMBO_FORM_SCREEN.DEACTIVATE.CONFIRM)
    ) {
      return;
    }
    void updateStatus(CATEGORY_STATUS.INACTIVE);
  };

  const handleReactivate = (): void => {
    void updateStatus(CATEGORY_STATUS.ACTIVE);
  };

  const handleDelete = (): void => {
    if (
      !comboId ||
      !window.confirm(COMBO_FORM_SCREEN.DELETE.CONFIRM)
    ) {
      return;
    }

    setIsBusy(true);
    setActionError(null);

    void fetch(API.ROUTES.COMBO(comboId), {
      method: API.METHODS.DELETE,
    }).then((response) => {
      setIsBusy(false);

      if (!response.ok) {
        setActionError(COMBO_FORM_SCREEN.ERROR.GENERIC);
        return;
      }

      router.replace(PATHS.ADMIN.COMBOS);
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
