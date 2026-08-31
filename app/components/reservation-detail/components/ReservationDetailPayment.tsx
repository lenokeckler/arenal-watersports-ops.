import type { JSX } from "react";
import { RESERVATION_DETAIL_SCREEN } from "@/app/constants";
import PriceAmounts from "@/app/components/price-amounts/PriceAmounts";
import type { ReservationChargeTotals } from "@/app/utils/reservas/reservationDetail";

interface ReservationDetailPaymentProps {
  chargeTotals: ReservationChargeTotals;
}

/**
 * US-RES-003: the state of the charge. Operaciones reading this reservation
 * always sees "sin cobro registrado" here — `reservation_charges` has no
 * select policy for that area, so the fetch already comes back empty.
 */
const ReservationDetailPayment = ({
  chargeTotals,
}: ReservationDetailPaymentProps): JSX.Element => (
  <section className="flex items-center justify-between gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {RESERVATION_DETAIL_SCREEN.CHARGES.TITLE}
    </h2>
    {chargeTotals.amountUsd === null &&
    chargeTotals.amountCrc === null ? (
      <span className="font-body-base text-body-base text-on-surface-variant">
        {RESERVATION_DETAIL_SCREEN.CHARGES.EMPTY}
      </span>
    ) : (
      <PriceAmounts
        amountCrc={chargeTotals.amountCrc}
        amountUsd={chargeTotals.amountUsd}
      />
    )}
  </section>
);

export default ReservationDetailPayment;
