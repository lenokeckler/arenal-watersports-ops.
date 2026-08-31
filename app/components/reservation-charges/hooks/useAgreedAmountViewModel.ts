"use client";

import { useState } from "react";
import {
  RESERVATION_CHARGES_SCREEN,
  STRING,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { saveAgreedAmounts } from "@/app/utils/reservas/reservationPricing";

interface UseAgreedAmountParams {
  agreedCrc: Nullable<number>;
  agreedUsd: Nullable<number>;
  onSaved: () => void;
  reservationId: string;
  workerId: string;
}

export interface AgreedAmountViewModel {
  crc: string;
  handleCrcChange: (value: string) => void;
  handleSubmit: () => void;
  handleUsdChange: (value: string) => void;
  isBusy: boolean;
  submitError: Nullable<string>;
  usd: string;
}

/** Una casilla vacia es "no se acordo nada en esta moneda", no un cero. */
const fieldToAmount = (value: string): Nullable<number> =>
  value.trim() ? Number(value) : null;

const amountToField = (amount: Nullable<number>): string =>
  amount === null || amount === undefined
    ? STRING.Empty
    : String(amount);

/**
 * US-RES-024/US-RES-025: lo que se acordo cobrar, en una moneda o en las dos.
 *
 * Las dos casillas existen a proposito: un cliente puede pagar cien dolares y
 * cincuenta mil colones por la misma salida, y cada moneda se salda contra lo
 * acordado en ella misma. Dejar las dos vacias tambien vale — es "todavia no
 * se ha cotizado" — y por eso no hay validacion de obligatorio aqui.
 */
export const useAgreedAmountViewModel = ({
  agreedCrc,
  agreedUsd,
  onSaved,
  reservationId,
  workerId,
}: UseAgreedAmountParams): AgreedAmountViewModel => {
  const [usd, setUsd] = useState(amountToField(agreedUsd));
  const [crc, setCrc] = useState(amountToField(agreedCrc));
  const [isBusy, setIsBusy] = useState(false);
  const [submitError, setSubmitError] =
    useState<Nullable<string>>(null);

  const handleSubmit = (): void => {
    setIsBusy(true);
    setSubmitError(null);

    void saveAgreedAmounts(
      createBrowserSupabaseClient(),
      reservationId,
      {
        crc: fieldToAmount(crc),
        usd: fieldToAmount(usd),
      },
      workerId
    )
      .then(() => {
        setIsBusy(false);
        onSaved();
      })
      .catch(() => {
        setIsBusy(false);
        setSubmitError(
          RESERVATION_CHARGES_SCREEN.AGREED.ERROR.GENERIC
        );
      });
  };

  return {
    crc,
    handleCrcChange: setCrc,
    handleSubmit,
    handleUsdChange: setUsd,
    isBusy,
    submitError,
    usd,
  };
};
