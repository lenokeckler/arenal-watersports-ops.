"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  API,
  CATEGORY_FORM_SCREEN,
  CATEGORY_STATUS,
  PATHS,
  type CategoryStatus,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";

interface UseCategoryStatusActionsReturn {
  actionError: Nullable<string>;
  handleDeactivate: () => void;
  handleDelete: () => void;
  handleReactivate: () => void;
  isBusy: boolean;
  status: CategoryStatus;
}

/**
 * US-ADM-012 (validaciones): a category that never had units or stock is
 * deleted outright; one that already has records is only ever marked
 * inactive, and can be reactivated later. Deactivate/reactivate are plain
 * `equipment_categories` updates the admin's own authenticated client can
 * make directly (`categories_update` already allows it); delete goes
 * through a service-role route because `DELETE` is revoked for
 * `authenticated` at the database level, the same reason worker permission
 * revocation does.
 */
export const useCategoryStatusActions = (
  categoryId: Nullable<string>,
  adminWorkerId: string,
  initialStatus: CategoryStatus
): UseCategoryStatusActionsReturn => {
  const router = useRouter();
  const [status, setStatus] =
    useState<CategoryStatus>(initialStatus);
  const [actionError, setActionError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const updateStatus = async (
    nextStatus: CategoryStatus
  ): Promise<void> => {
    if (!categoryId) {
      return;
    }

    setIsBusy(true);
    setActionError(null);

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("equipment_categories")
      .update({
        status: nextStatus,
        updated_by: adminWorkerId,
      })
      .eq("id", categoryId);

    setIsBusy(false);

    if (error) {
      setActionError(CATEGORY_FORM_SCREEN.ERROR.GENERIC);
      return;
    }

    setStatus(nextStatus);
  };

  const handleDeactivate = (): void => {
    if (
      !window.confirm(
        CATEGORY_FORM_SCREEN.DEACTIVATE.CONFIRM
      )
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
      !categoryId ||
      !window.confirm(CATEGORY_FORM_SCREEN.DELETE.CONFIRM)
    ) {
      return;
    }

    setIsBusy(true);
    setActionError(null);

    void fetch(API.ROUTES.CATEGORY(categoryId), {
      method: API.METHODS.DELETE,
    }).then((response) => {
      setIsBusy(false);

      if (!response.ok) {
        setActionError(CATEGORY_FORM_SCREEN.ERROR.GENERIC);
        return;
      }

      router.replace(PATHS.ADMIN.CATEGORIES);
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
