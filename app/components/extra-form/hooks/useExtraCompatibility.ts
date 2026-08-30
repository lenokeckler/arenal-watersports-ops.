"use client";

import { useState } from "react";
import { API, EXTRA_FORM_SCREEN, type ApiMethod } from "@/app/constants";
import type { Nullable } from "@/app/types";

interface UseExtraCompatibilityReturn {
  actionError: Nullable<string>;
  compatibleUnitIds: string[];
  handleToggleUnit: (unitId: string, isCompatible: boolean) => void;
  isBusy: boolean;
}

/**
 * US-ADM-020: each checkbox takes effect immediately, the same "grant/revoke
 * through a service-role route" shape `useWorkerDetailViewModel` uses for
 * areas and marks — `extra_compat_insert`/`_update` allow an admin's own
 * client, but removing a row needs `DELETE`, revoked for `authenticated` at
 * the database level, so both directions share one route.
 */
export const useExtraCompatibility = (
  extraId: Nullable<string>,
  initialCompatibleUnitIds: string[]
): UseExtraCompatibilityReturn => {
  const [compatibleUnitIds, setCompatibleUnitIds] = useState<string[]>(
    initialCompatibleUnitIds
  );
  const [actionError, setActionError] = useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const changeCompatibility = async (
    method: ApiMethod,
    unitId: string
  ): Promise<boolean> => {
    if (!extraId) {
      return false;
    }

    setIsBusy(true);
    setActionError(null);

    const response = await fetch(
      API.ROUTES.EXTRA_COMPATIBILITY(extraId),
      {
        body: JSON.stringify({ unitId }),
        headers: { [API.HEADERS.CONTENT_TYPE]: API.HEADERS.JSON },
        method,
      }
    );

    setIsBusy(false);

    if (!response.ok) {
      setActionError(EXTRA_FORM_SCREEN.ERROR.GENERIC);
      return false;
    }

    return true;
  };

  const handleToggleUnit = (
    unitId: string,
    isCompatible: boolean
  ): void => {
    void changeCompatibility(
      isCompatible ? API.METHODS.DELETE : API.METHODS.POST,
      unitId
    ).then((ok) => {
      if (!ok) {
        return;
      }
      setCompatibleUnitIds((current) =>
        isCompatible
          ? current.filter((existing) => existing !== unitId)
          : [...current, unitId]
      );
    });
  };

  return { actionError, compatibleUnitIds, handleToggleUnit, isBusy };
};
