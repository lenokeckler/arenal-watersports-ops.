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
import { pickCurrencyAmount } from "@/app/utils/reservas/currencyAmount";
import { registerReservationDeposit } from "@/app/utils/reservas/registerReservationDeposit";
import { validateDepositAmount } from "@/app/utils/reservas/reservationMoneyValidation";
import type { ReservationChargesProps } from "../models/ReservationChargesProps.interface";
import type { DepositRegisterViewModel } from "../models/DepositFormViewModel.interface";

const EMPTY_TEXT = "";

type DepositRegisterParams = Pick<
  ReservationChargesProps,
  "context" | "depositProposal" | "workerId"
> & { onSaved: () => void };

/**
 * US-RES-029: the office received the deposit, so reservas records it.
 * The proposal comes from the category of the equipment going out, and
 * the moment it is saved the deposit is `held` — which is exactly the
 * pending list of US-RES-033.
 */
export const useDepositRegisterViewModel = ({
  context,
  depositProposal,
  onSaved,
  workerId,
}: DepositRegisterParams): DepositRegisterViewModel => {
  const [currency, setCurrency] = useState<CurrencyCode>(
    CURRENCY_CODE.USD
  );
  const [amount, setAmount] = useState(EMPTY_TEXT);
  const [amountError, setAmountError] =
    useState<NullableRef<string>>(null);
  const [submitError, setSubmitError] =
    useState<NullableRef<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const proposedAmount = pickCurrencyAmount(
    currency,
    depositProposal
  );

  const handleSubmit = (): void => {
    const parsedAmount = Number(amount);
    const nextError = validateDepositAmount(parsedAmount);
    setAmountError(nextError);
    if (nextError) {
      return;
    }

    setIsBusy(true);
    setSubmitError(null);
    void registerReservationDeposit(
      createBrowserSupabaseClient(),
      {
        amount: parsedAmount,
        currency,
        reservationId: context.id,
      },
      workerId
    )
      .then(() => {
        // `onSaved` refresca el Server Component, pero este componente de
        // cliente no se desmonta: sin devolver la bandera, el boton queda
        // deshabilitado con "Loading..." y no se puede registrar un segundo
        // movimiento sin recargar la pagina. Eso rompia el cobro en dos
        // tractos de US-RES-026 en la practica.
        setIsBusy(false);
        setAmount(EMPTY_TEXT);
        onSaved();
      })
      .catch(() => {
        setIsBusy(false);
        setSubmitError(
          RESERVATION_CHARGES_SCREEN.DEPOSIT.ERROR.GENERIC
        );
      });
  };

  return {
    amount,
    amountError,
    currency,
    handleAmountChange: setAmount,
    handleCurrencyChange: setCurrency,
    handleSubmit,
    handleUseProposal: () =>
      setAmount(
        proposedAmount === null
          ? EMPTY_TEXT
          : String(proposedAmount)
      ),
    isBusy,
    proposedAmount,
    submitError,
  };
};
