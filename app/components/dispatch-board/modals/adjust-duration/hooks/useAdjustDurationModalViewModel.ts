"use client";

import { useState } from "react";
import {
  DISPATCH_BOARD_SCREEN,
  OPERATIONS_NUMBERS,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  adjustDispatchedDuration,
  computeExtendedMinutes,
} from "@/app/utils/operaciones/adjustDispatchedDuration";

interface UseAdjustDurationModalViewModelParams {
  currentExtraTimeMinutes: number;
  onAdjusted: () => void;
  previousDurationMinutes: number;
  reservationId: string;
  workerId: string;
}

export interface UseAdjustDurationModalViewModelReturn {
  durationMinutes: number;
  error: Nullable<string>;
  extendedMinutes: number;
  handleDurationChange: (value: number) => void;
  handleSubmit: () => void;
  isBusy: boolean;
}

/** US-OPE-006: extends or trims the countdown of a dispatched reservation. */
export const useAdjustDurationModalViewModel = ({
  currentExtraTimeMinutes,
  onAdjusted,
  previousDurationMinutes,
  reservationId,
  workerId,
}: UseAdjustDurationModalViewModelParams): UseAdjustDurationModalViewModelReturn => {
  const [durationMinutes, setDurationMinutes] = useState(
    previousDurationMinutes
  );
  const [error, setError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = (): void => {
    if (
      durationMinutes <
      OPERATIONS_NUMBERS.MIN_DURATION_MINUTES
    ) {
      setError(DISPATCH_BOARD_SCREEN.ADJUST.ERROR);
      return;
    }

    setIsBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();

    void adjustDispatchedDuration(supabase, {
      currentExtraTimeMinutes,
      newDurationMinutes: durationMinutes,
      previousDurationMinutes,
      reservationId,
      workerId,
    })
      .then(onAdjusted)
      .catch(() => {
        setIsBusy(false);
        setError(DISPATCH_BOARD_SCREEN.ADJUST.ERROR);
      });
  };

  return {
    durationMinutes,
    error,
    extendedMinutes: computeExtendedMinutes(
      previousDurationMinutes,
      durationMinutes
    ),
    handleDurationChange: setDurationMinutes,
    handleSubmit,
    isBusy,
  };
};
