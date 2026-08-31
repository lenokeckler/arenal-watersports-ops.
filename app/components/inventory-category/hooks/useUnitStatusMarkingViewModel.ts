"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OPERATIONS_INVENTORY_SCREEN,
  type UnitStatus,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { updateUnitStatus } from "@/app/utils/operaciones/unitStatus";

export interface UnitStatusMarkingViewModel {
  busyUnitId: Nullable<string>;
  error: Nullable<string>;
  handleStatusChange: (
    unitId: string,
    status: UnitStatus
  ) => void;
}

/**
 * US-OPE-022 for a `by_unit` category: "al marcar dañada una unidad de una
 * categoría reservable, el tablero deja de ofrecerla en ese mismo
 * momento". That immediacy is not this hook's doing —
 * `unit_current_state` derives availability from the status column, so the
 * single update is enough and `router.refresh()` only catches this screen
 * up. The signature is `updated_by` (RNF-024).
 */
export const useUnitStatusMarkingViewModel = (
  workerId: string
): UnitStatusMarkingViewModel => {
  const router = useRouter();
  const [busyUnitId, setBusyUnitId] =
    useState<Nullable<string>>(null);
  const [error, setError] =
    useState<Nullable<string>>(null);

  const handleStatusChange = (
    unitId: string,
    status: UnitStatus
  ): void => {
    setBusyUnitId(unitId);
    setError(null);

    void updateUnitStatus(
      createBrowserSupabaseClient(),
      unitId,
      status,
      workerId
    )
      .then(() => {
        setBusyUnitId(null);
        router.refresh();
      })
      .catch(() => {
        setBusyUnitId(null);
        setError(OPERATIONS_INVENTORY_SCREEN.DETAIL.ERROR);
      });
  };

  return { busyUnitId, error, handleStatusChange };
};
