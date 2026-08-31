"use client";

import { useState } from "react";
import {
  DEPOSIT_STATUS,
  RESERVATION_CHARGES_SCREEN,
  type DepositStatus,
} from "@/app/constants";
import type { NullableRef } from "@/app/types";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { resolveReservationDeposit } from "@/app/utils/reservas/resolveReservationDeposit";
import {
  validateDepositResolution,
  type DepositResolutionErrors,
} from "@/app/utils/reservas/reservationMoneyValidation";
import type { DepositRecord } from "@/app/utils/reservas/reservationMovementRecords";
import type { DepositResolutionViewModel } from "../models/DepositFormViewModel.interface";

const NO_ERRORS: DepositResolutionErrors = {};
const EMPTY_TEXT = "";

interface DepositResolutionParams {
  deposit: DepositRecord;
  onSaved: () => void;
}

const isReturn = (status: DepositStatus): boolean =>
  status === DEPOSIT_STATUS.RETURNED;

/**
 * US-RES-030: the equipment came back in order and the deposit is
 * released, or there was damage and part or all of it stays — with how
 * much and why. `retained_amount` and `retention_reason` are cleared on a
 * full return so `deposits_resolution_shape` sees the shape it expects,
 * and neither `resolved_by` nor `resolved_at` is sent: the database
 * stamps both from the session (`stamp_deposit_audit`), which is what
 * keeps that signature from being forged.
 */
export const useDepositResolutionViewModel = ({
  deposit,
  onSaved,
}: DepositResolutionParams): DepositResolutionViewModel => {
  const [status, setStatus] = useState<DepositStatus>(
    DEPOSIT_STATUS.RETURNED
  );
  const [retainedAmount, setRetainedAmount] =
    useState(EMPTY_TEXT);
  const [retentionReason, setRetentionReason] =
    useState(EMPTY_TEXT);
  const [errors, setErrors] =
    useState<DepositResolutionErrors>(NO_ERRORS);
  const [submitError, setSubmitError] =
    useState<NullableRef<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = (): void => {
    const parsedRetained = Number(retainedAmount);
    const nextErrors = validateDepositResolution({
      depositAmount: deposit.amount,
      retainedAmount: parsedRetained,
      retentionReason,
      status,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsBusy(true);
    setSubmitError(null);
    void resolveReservationDeposit(
      createBrowserSupabaseClient(),
      {
        depositId: deposit.id,
        retainedAmount: isReturn(status)
          ? null
          : parsedRetained,
        retentionReason: isReturn(status)
          ? null
          : retentionReason.trim(),
        status,
      }
    )
      .then(() => {
        // `onSaved` refresca el Server Component, pero este componente de
        // cliente no se desmonta: sin devolver la bandera, el boton queda
        // deshabilitado con "Loading..." y no se puede registrar un segundo
        // movimiento sin recargar la pagina. Eso rompia el cobro en dos
        // tractos de US-RES-026 en la practica.
        setIsBusy(false);
        onSaved();
      })
      .catch(() => {
        setIsBusy(false);
        setSubmitError(
          RESERVATION_CHARGES_SCREEN.DEPOSIT.ERROR
            .RESOLVE_GENERIC
        );
      });
  };

  const handleStatusChange = (
    nextStatus: DepositStatus
  ): void => {
    setStatus(nextStatus);
    setRetainedAmount(
      nextStatus === DEPOSIT_STATUS.RETAINED
        ? String(deposit.amount)
        : EMPTY_TEXT
    );
  };

  return {
    errors,
    handleReasonChange: setRetentionReason,
    handleRetainedAmountChange: setRetainedAmount,
    handleStatusChange,
    handleSubmit,
    isBusy,
    retainedAmount,
    retentionReason,
    status,
    submitError,
  };
};
