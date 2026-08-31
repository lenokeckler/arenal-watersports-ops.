"use client";

import { useState } from "react";
import {
  CHARGE_KIND,
  CURRENCY_CODE,
  PAYMENT_METHOD,
  RESERVATION_CHARGES_SCREEN,
  type ChargeKind,
  type CurrencyCode,
} from "@/app/constants";
import type { NullableRef } from "@/app/types";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { pickCurrencyAmount } from "@/app/utils/reservas/currencyAmount";
import { registerReservationCharge } from "@/app/utils/reservas/registerReservationCharge";
import {
  validateChargeForm,
  type ChargeFormErrors,
} from "@/app/utils/reservas/reservationMoneyValidation";
import type { ReservationChargesProps } from "../models/ReservationChargesProps.interface";
import type { ChargeFormViewModel } from "../models/ChargeFormViewModel.interface";

const NO_ERRORS: ChargeFormErrors = {};
const EMPTY_TEXT = "";

type ChargeFormParams = Pick<
  ReservationChargesProps,
  "context" | "proposal" | "workerId"
> & { onSaved: () => void };

/**
 * US-RES-023 through US-RES-027 and US-RES-031: one movement of money
 * coming in. The proposal is only ever a suggestion — the amount that
 * gets stored is whatever reservas confirms, without margin or cap
 * (US-RES-024) — and each movement carries its own currency and method,
 * which is how the same reservation ends up paid half in dollars and half
 * in colones (US-RES-026).
 */
export const useChargeFormViewModel = ({
  context,
  onSaved,
  proposal,
  workerId,
}: ChargeFormParams): ChargeFormViewModel => {
  const [kind, setKind] = useState<ChargeKind>(
    context.isSplitChild
      ? CHARGE_KIND.EXTRA_TIME
      : CHARGE_KIND.TARIFF
  );
  const [currency, setCurrency] = useState<CurrencyCode>(
    CURRENCY_CODE.USD
  );
  const [amount, setAmount] = useState(EMPTY_TEXT);
  const [method, setMethod] = useState<string>(
    PAYMENT_METHOD.CASH
  );
  const [otherMethod, setOtherMethod] =
    useState(EMPTY_TEXT);
  const [errors, setErrors] =
    useState<ChargeFormErrors>(NO_ERRORS);
  const [submitError, setSubmitError] =
    useState<NullableRef<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const proposedAmount = pickCurrencyAmount(
    currency,
    kind === CHARGE_KIND.TARIFF
      ? proposal.tariffAmounts
      : proposal.extraTimeAmounts
  );
  const resolvedMethod =
    method === PAYMENT_METHOD.OTHER ? otherMethod : method;

  const handleSubmit = (): void => {
    const parsedAmount = Number(amount);
    const nextErrors = validateChargeForm(
      parsedAmount,
      resolvedMethod
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsBusy(true);
    setSubmitError(null);
    void registerReservationCharge(
      createBrowserSupabaseClient(),
      {
        amount: parsedAmount,
        currency,
        kind,
        paymentMethod: resolvedMethod.trim(),
        reservationId: context.id,
      },
      workerId
    )
      .then(() => {
        setAmount(EMPTY_TEXT);
        onSaved();
      })
      .catch(() => {
        setIsBusy(false);
        setSubmitError(
          RESERVATION_CHARGES_SCREEN.CHARGE_FORM.ERROR
            .GENERIC
        );
      });
  };

  return {
    amount,
    currency,
    errors,
    handleAmountChange: setAmount,
    handleCurrencyChange: setCurrency,
    handleKindChange: setKind,
    handleMethodChange: setMethod,
    handleOtherMethodChange: setOtherMethod,
    handleSubmit,
    handleUseProposal: () =>
      setAmount(
        proposedAmount === null
          ? EMPTY_TEXT
          : String(proposedAmount)
      ),
    isBusy,
    isTariffBlocked: context.isSplitChild,
    kind,
    method,
    otherMethod,
    proposedAmount,
    submitError,
  };
};
