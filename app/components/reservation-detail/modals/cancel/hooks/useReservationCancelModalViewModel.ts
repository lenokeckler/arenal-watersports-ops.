"use client";

import { useState } from "react";
import { RESERVATION_DETAIL_SCREEN } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { cancelReservation } from "@/app/utils/reservas/cancelReservation";

interface UseReservationCancelModalViewModelParams {
  onCancelled: () => void;
  reservationId: string;
  workerId: string;
}

export interface UseReservationCancelModalViewModelReturn {
  error: Nullable<string>;
  handleReasonChange: (value: string) => void;
  handleSubmit: () => void;
  isBusy: boolean;
  reason: string;
}

/** US-RES-021/US-RES-022: the reason is mandatory, everything else is one write. */
export const useReservationCancelModalViewModel = ({
  onCancelled,
  reservationId,
  workerId,
}: UseReservationCancelModalViewModelParams): UseReservationCancelModalViewModelReturn => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<Nullable<string>>(
    null
  );
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = (): void => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError(
        RESERVATION_DETAIL_SCREEN.CANCEL.REASON_REQUIRED
      );
      return;
    }

    setIsBusy(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    void cancelReservation(
      supabase,
      reservationId,
      trimmedReason,
      workerId
    )
      .then(onCancelled)
      .catch(() => {
        setIsBusy(false);
        setError(RESERVATION_DETAIL_SCREEN.CANCEL.ERROR);
      });
  };

  return {
    error,
    handleReasonChange: setReason,
    handleSubmit,
    isBusy,
    reason,
  };
};
