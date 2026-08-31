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
  proposal,
}: Pick<
  ReservationChargesProps,
  "context" | "movements" | "proposal"
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

  // US-RES-026: a renta or a tour stores no price of its own — only the
  // combo flow writes `list_amount_*` — so without this fallback "cuánto
  // falta" would read "—" on the most ordinary reservation there is. The
  // catalog proposal *is* the list price (tariff by duration), so it fills
  // that column. A split child is left out on purpose: its tariff stayed
  // whole on the original reservation (US-RES-019), so it owes nothing.
  const listAmounts = {
    crc: context.isSplitChild
      ? context.listAmountCrc
      : (context.listAmountCrc ??
        proposal.tariffAmounts.crc),
    usd: context.isSplitChild
      ? context.listAmountUsd
      : (context.listAmountUsd ??
        proposal.tariffAmounts.usd),
  };

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
      listAmounts,
      refunds: movements.refunds,
    }),
  };
};
