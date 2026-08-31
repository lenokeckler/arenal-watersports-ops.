import type { JSX } from "react";
import {
  CURRENCY_LABEL,
  DEPOSIT_STATUS_LABEL,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import Badge from "@/app/components/badge/Badge";
import type { DepositRecord } from "@/app/utils/reservas/reservationMovementRecords";

interface DepositHistoryListProps {
  deposits: DepositRecord[];
}

const AMOUNT_DECIMALS = 2;

/** US-RES-030: every deposit of this reservation and how it ended. */
const DepositHistoryList = ({
  deposits,
}: DepositHistoryListProps): JSX.Element => (
  <ul className="flex flex-col gap-1">
    {deposits.map((deposit) => (
      <li
        key={deposit.id}
        className="flex flex-col gap-1 rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm"
      >
        <div className="flex items-center justify-between gap-sm">
          <Badge className="border-white/10 bg-surface-container-high text-on-surface-variant">
            {DEPOSIT_STATUS_LABEL[deposit.status]}
          </Badge>
          <span className="font-label-mono text-label-mono text-primary">
            {CURRENCY_LABEL[deposit.currency]}
            {deposit.amount.toFixed(AMOUNT_DECIMALS)}
          </span>
        </div>
        {deposit.retentionReason && (
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {CURRENCY_LABEL[deposit.currency]}
            {(deposit.retainedAmount ?? 0).toFixed(
              AMOUNT_DECIMALS
            )}{" "}
            · {deposit.retentionReason}
          </span>
        )}
        {deposit.resolvedByName && (
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {RESERVATION_CHARGES_SCREEN.DEPOSIT.RESOLVED_BY(
              deposit.resolvedByName
            )}
          </span>
        )}
      </li>
    ))}
  </ul>
);

export default DepositHistoryList;
