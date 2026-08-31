"use client";

import { useRouter } from "next/navigation";
import {
  DEPOSIT_STATUS,
  RESERVATION_STATUS,
} from "@/app/constants";
import { summarizeReservationMoney } from "@/app/utils/reservas/reservationMoneySummary";
import type { ReservationChargesProps } from "../models/ReservationChargesProps.interface";
import type { ReservationChargesViewModel } from "../models/ReservationChargesViewModel.interface";

const SINGLE_CURRENCY = 1;

/**
 * EP-RES-07: what the whole screen is allowed to do with this
 * reservation's money, and how the movements already recorded add up per
 * currency. Every write below refreshes the server component instead of
 * patching state by hand, so the figures on screen always come back from
 * the database rather than from an optimistic guess about money.
 */
export const useReservationChargesViewModel = ({
  context,
  movements,
}: Pick<
  ReservationChargesProps,
  "context" | "movements"
>): ReservationChargesViewModel => {
  const router = useRouter();

  const heldDeposit =
    movements.deposits.find(
      (deposit) => deposit.status === DEPOSIT_STATUS.HELD
    ) ?? null;
  const isSettled =
    context.status === RESERVATION_STATUS.CLOSED ||
    context.status === RESERVATION_STATUS.CANCELLED;
  const currenciesInPlay = new Set(
    movements.charges.map((charge) => charge.currency)
  );

  return {
    canRegisterDeposit:
      !context.isSplitChild && heldDeposit === null,
    canResolveDeposit: heldDeposit !== null && isSettled,
    handleSaved: () => router.refresh(),
    heldDeposit,
    isMixedCurrency:
      currenciesInPlay.size > SINGLE_CURRENCY,
    summaryRows: summarizeReservationMoney({
      agreedAmounts: {
        crc: context.agreedAmountCrc,
        usd: context.agreedAmountUsd,
      },
      charges: movements.charges,
      listAmounts: {
        crc: context.listAmountCrc,
        usd: context.listAmountUsd,
      },
      refunds: movements.refunds,
    }),
  };
};
