"use client";

import { useState } from "react";
import {
  CURRENCY_CODE,
  RESERVATION_CHARGES_SCREEN,
  type CurrencyCode,
} from "@/app/constants";
import type { NullableRef } from "@/app/types";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import {
  refundableAmount,
  refundAmountForPercentage,
} from "@/app/utils/reservas/refundMath";
import { registerReservationRefund } from "@/app/utils/reservas/registerReservationRefund";
import {
  validateRefundForm,
  type RefundFormErrors,
} from "@/app/utils/reservas/reservationMoneyValidation";
import type { ReservationChargesProps } from "../models/ReservationChargesProps.interface";
import type { RefundFormViewModel } from "../models/RefundFormViewModel.interface";

const NO_ERRORS: RefundFormErrors = {};
const EMPTY_TEXT = "";

type RefundFormParams = Pick<
  ReservationChargesProps,
  "context" | "movements" | "workerId"
> & { onSaved: () => void };

/**
 * US-RES-028: reservas states the percentage returned and the system
 * turns it into the amount that comes off the day's income. The ceiling
 * is enforced here because the database only checks that a refund is
 * positive — nothing in the schema would stop a reservation's net from
 * going below zero.
 */
export const useRefundFormViewModel = ({
  context,
  movements,
  onSaved,
  workerId,
}: RefundFormParams): RefundFormViewModel => {
  const [currency, setCurrency] = useState<CurrencyCode>(
    CURRENCY_CODE.USD
  );
  const [percentage, setPercentage] = useState(EMPTY_TEXT);
  const [reason, setReason] = useState(EMPTY_TEXT);
  const [errors, setErrors] =
    useState<RefundFormErrors>(NO_ERRORS);
  const [submitError, setSubmitError] =
    useState<NullableRef<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const parsedPercentage = Number(percentage);
  const computedAmount = refundAmountForPercentage(
    parsedPercentage,
    movements.charges,
    currency
  );
  const stillRefundable = refundableAmount(
    movements.charges,
    movements.refunds,
    currency
  );

  const handleSubmit = (): void => {
    const nextErrors = validateRefundForm({
      computedAmount,
      percentage: parsedPercentage,
      reason,
      refundableAmount: stillRefundable,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsBusy(true);
    setSubmitError(null);
    void registerReservationRefund(
      createBrowserSupabaseClient(),
      {
        amount: computedAmount,
        currency,
        percentage: parsedPercentage,
        reason: reason.trim(),
        reservationId: context.id,
      },
      workerId
    )
      .then(() => {
        setPercentage(EMPTY_TEXT);
        setReason(EMPTY_TEXT);
        onSaved();
      })
      .catch(() => {
        setIsBusy(false);
        setSubmitError(
          RESERVATION_CHARGES_SCREEN.REFUND.ERROR.GENERIC
        );
      });
  };

  return {
    computedAmount,
    currency,
    errors,
    handleCurrencyChange: setCurrency,
    handlePercentageChange: setPercentage,
    handleReasonChange: setReason,
    handleSubmit,
    isBusy,
    percentage,
    reason,
    refundableAmount: stillRefundable,
    submitError,
  };
};
