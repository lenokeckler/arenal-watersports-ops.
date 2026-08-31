import type { JSX } from "react";
import {
  CURRENCY_LABEL,
  MATERIAL_ICON_NAME,
  PATHS,
  PENDING_DEPOSITS_SCREEN,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { DepositRow } from "@/app/utils/administracion/reports";

interface PendingDepositRowProps {
  deposit: DepositRow;
}

/**
 * US-RES-033: one line of money the company is holding for a client, with
 * the reservation it belongs to and a way straight to where it gets
 * resolved (US-RES-030).
 */
const PendingDepositRow = ({
  deposit,
}: PendingDepositRowProps): JSX.Element => (
  <li className="flex items-center justify-between gap-sm rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm">
    <div className="flex flex-col">
      <span className="font-body-base text-body-base text-on-surface">
        {deposit.customerName}
      </span>
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {deposit.reservationCode}
      </span>
    </div>
    <div className="flex items-center gap-sm">
      <span className="font-label-mono text-label-mono text-primary">
        {CURRENCY_LABEL[deposit.currency]}
        {deposit.amount.toFixed(2)}
      </span>
      <Link
        href={PATHS.RESERVATIONS.CHARGES_BY_ID(
          deposit.reservationId
        )}
        className="flex min-h-12 items-center gap-1 rounded-lg border border-white/10 px-sm font-button text-button uppercase text-on-surface hover:border-primary/40 hover:text-primary"
      >
        {PENDING_DEPOSITS_SCREEN.RESOLVE}
        <MaterialIcon
          name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
          className="!text-[18px]"
        />
      </Link>
    </div>
  </li>
);

export default PendingDepositRow;
