import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  RESERVATION_DETAIL_SCREEN,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import PriceAmounts from "@/app/components/price-amounts/PriceAmounts";
import type { ReservationDetail } from "@/app/utils/reservas/reservationDetail";

interface ReservationDetailPaymentProps {
  reservation: ReservationDetail;
}

const PriceLine = ({
  amountCrc,
  amountUsd,
  label,
}: {
  amountCrc: number | null | undefined;
  amountUsd: number | null | undefined;
  label: string;
}): JSX.Element => (
  <div className="flex items-start justify-between gap-sm">
    <span className="font-body-base text-body-base text-on-surface-variant">
      {label}
    </span>
    <PriceAmounts
      amountCrc={amountCrc}
      amountUsd={amountUsd}
    />
  </div>
);

/**
 * US-RES-003 and EP-RES-07: the state of the charge — the list price, the
 * price actually agreed, and what has been charged so far, each currency
 * on its own line because the system converts nothing. Only rendered for
 * reservas and administración: operaciones does not see money, and since
 * the amounts moved to `reservation_pricing` the policy denies them the
 * same way it denies `reservation_charges`. Not rendering the section is
 * no longer the only thing keeping operaciones out of it.
 */
const ReservationDetailPayment = ({
  reservation,
}: ReservationDetailPaymentProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {RESERVATION_DETAIL_SCREEN.CHARGES.TITLE}
    </h2>

    <PriceLine
      amountCrc={reservation.listAmountCrc}
      amountUsd={reservation.listAmountUsd}
      label={RESERVATION_DETAIL_SCREEN.CHARGES.LIST}
    />
    <PriceLine
      amountCrc={reservation.agreedAmountCrc}
      amountUsd={reservation.agreedAmountUsd}
      label={RESERVATION_DETAIL_SCREEN.CHARGES.AGREED}
    />

    <div className="flex items-start justify-between gap-sm border-t border-white/10 pt-sm">
      <span className="font-body-base text-body-base text-on-surface-variant">
        {RESERVATION_DETAIL_SCREEN.CHARGES.CHARGED}
      </span>
      {reservation.chargeTotals.amountUsd === null &&
      reservation.chargeTotals.amountCrc === null ? (
        <span className="font-body-base text-body-base text-on-surface-variant">
          {RESERVATION_DETAIL_SCREEN.CHARGES.EMPTY}
        </span>
      ) : (
        <PriceAmounts
          amountCrc={reservation.chargeTotals.amountCrc}
          amountUsd={reservation.chargeTotals.amountUsd}
        />
      )}
    </div>

    <Link
      href={PATHS.RESERVATIONS.CHARGES_BY_ID(
        reservation.id
      )}
      className="flex min-h-14 items-center justify-between rounded-lg border border-white/10 px-sm font-button text-button uppercase text-on-surface hover:border-primary/40 hover:text-primary"
    >
      {RESERVATION_DETAIL_SCREEN.CHARGES.MANAGE}
      <MaterialIcon
        name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
      />
    </Link>
  </section>
);

export default ReservationDetailPayment;
