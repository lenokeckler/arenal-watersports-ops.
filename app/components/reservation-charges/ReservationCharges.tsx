"use client";

import type { JSX } from "react";
import ReservationChargesHeader from "./components/ReservationChargesHeader";
import ChargeSummarySection from "./components/ChargeSummarySection";
import ExtraTimeSection from "./components/ExtraTimeSection";
import ChargeFormSection from "./components/ChargeFormSection";
import DepositSection from "./components/DepositSection";
import RefundSection from "./components/RefundSection";
import MovementsSection from "./components/MovementsSection";
import { useReservationChargesViewModel } from "./hooks/useReservationChargesViewModel";
import type { ReservationChargesProps } from "./models/ReservationChargesProps.interface";

/**
 * `/reservas/cobros/[reservationId]` (EP-RES-07, US-RES-023 through
 * US-RES-031). A client component because every block below writes from
 * the worker's own session — which is what makes the row-level policies
 * apply to the person actually doing it — while the figures it shows come
 * back from the server on every refresh, never from an optimistic guess
 * about money.
 */
const ReservationCharges = ({
  context,
  depositProposal,
  movements,
  proposal,
  workerId,
}: ReservationChargesProps): JSX.Element => {
  const {
    canRegisterDeposit,
    canResolveDeposit,
    handleSaved,
    heldDeposit,
    isMixedCurrency,
    summaryRows,
  } = useReservationChargesViewModel({
    context,
    movements,
  });

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <ReservationChargesHeader context={context} />

      <main className="mx-auto flex max-w-3xl flex-col gap-md">
        <ChargeSummarySection
          isMixedCurrency={isMixedCurrency}
          isSplitChild={context.isSplitChild}
          rows={summaryRows}
        />
        <ExtraTimeSection
          minutes={proposal.extraTimeMinutes}
        />
        <ChargeFormSection
          context={context}
          onSaved={handleSaved}
          proposal={proposal}
          workerId={workerId}
        />
        <DepositSection
          canRegister={canRegisterDeposit}
          canResolve={canResolveDeposit}
          context={context}
          depositProposal={depositProposal}
          deposits={movements.deposits}
          heldDeposit={heldDeposit}
          onSaved={handleSaved}
          workerId={workerId}
        />
        <RefundSection
          context={context}
          movements={movements}
          onSaved={handleSaved}
          workerId={workerId}
        />
        <MovementsSection movements={movements} />
      </main>
    </div>
  );
};

export default ReservationCharges;
