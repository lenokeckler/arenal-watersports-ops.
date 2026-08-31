import type { JSX } from "react";
import {
  CHARGE_KIND_LABEL,
  CURRENCY_LABEL,
  MATERIAL_ICON_NAME,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import { formatShortDate } from "@/app/utils/tablero/formatDateTime";
import type { ReservationMovements } from "@/app/utils/reservas/reservationMovements";
import ChargesSection from "./ChargesSection";

interface MovementsSectionProps {
  movements: ReservationMovements;
}

const NO_MOVEMENTS = 0;
const AMOUNT_DECIMALS = 2;

interface MovementLineProps {
  amount: string;
  detail: string;
  title: string;
}

const MovementLine = ({
  amount,
  detail,
  title,
}: MovementLineProps): JSX.Element => (
  <li className="flex items-start justify-between gap-sm rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm">
    <div className="flex flex-col">
      <span className="font-body-base text-body-base text-on-surface">
        {title}
      </span>
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {detail}
      </span>
    </div>
    <span className="font-label-mono text-label-mono text-primary">
      {amount}
    </span>
  </li>
);

/**
 * US-RES-023/US-RES-026/US-RES-028: every movement already recorded on
 * this reservation, each with the worker who made it — "el cobro queda
 * registrado a nombre de quien lo hizo".
 */
const MovementsSection = ({
  movements,
}: MovementsSectionProps): JSX.Element => {
  const isEmpty =
    movements.charges.length === NO_MOVEMENTS &&
    movements.refunds.length === NO_MOVEMENTS;

  return (
    <ChargesSection
      icon={MATERIAL_ICON_NAME.HISTORY}
      title={RESERVATION_CHARGES_SCREEN.MOVEMENTS.TITLE}
    >
      {isEmpty ? (
        <p className="font-body-base text-body-base text-on-surface-variant">
          {RESERVATION_CHARGES_SCREEN.MOVEMENTS.EMPTY}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {movements.charges.map((charge) => (
            <MovementLine
              key={charge.id}
              amount={`${CURRENCY_LABEL[charge.currency]}${charge.amount.toFixed(AMOUNT_DECIMALS)}`}
              detail={`${charge.paymentMethod} · ${charge.createdByName} · ${formatShortDate(charge.createdAt)}`}
              title={CHARGE_KIND_LABEL[charge.kind]}
            />
          ))}
          {movements.refunds.map((refund) => (
            <MovementLine
              key={refund.id}
              amount={`-${CURRENCY_LABEL[refund.currency]}${refund.amount.toFixed(AMOUNT_DECIMALS)}`}
              detail={`${refund.reason} · ${refund.createdByName} · ${formatShortDate(refund.createdAt)}`}
              title={RESERVATION_CHARGES_SCREEN.MOVEMENTS.REFUND_LABEL(
                refund.percentage
              )}
            />
          ))}
        </ul>
      )}
    </ChargesSection>
  );
};

export default MovementsSection;
