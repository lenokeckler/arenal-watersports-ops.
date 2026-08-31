import type { JSX } from "react";
import { formatAmount } from "@/app/utils/money/formatAmount";
import {
  CURRENCY_LABEL,
  REPORTS_SCREEN,
} from "@/app/constants";
import type { DepositRow } from "@/app/utils/administracion/reports";

interface DepositsSectionProps {
  pendingDeposits: DepositRow[];
  retainedDeposits: DepositRow[];
}

const NO_ROWS = 0;

const DepositList = ({
  emptyState,
  rows,
  showReason,
}: {
  emptyState: string;
  rows: DepositRow[];
  showReason: boolean;
}): JSX.Element =>
  rows.length === NO_ROWS ? (
    <p className="font-body-base text-body-base text-on-surface-variant">
      {emptyState}
    </p>
  ) : (
    <ul className="flex flex-col gap-1">
      {rows.map((deposit) => (
        <li
          key={deposit.id}
          className="flex flex-col gap-1 rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm"
        >
          <div className="flex items-center justify-between">
            <span className="font-body-base text-body-base text-on-surface">
              {deposit.reservationCode} —{" "}
              {deposit.customerName}
            </span>
            <span className="font-label-mono text-label-mono text-primary">
              {CURRENCY_LABEL[deposit.currency]}
              {formatAmount(
                deposit.retainedAmount ?? deposit.amount
              )}
            </span>
          </div>
          {showReason && deposit.retentionReason && (
            <span className="font-label-mono text-label-mono text-on-surface-variant">
              {REPORTS_SCREEN.DEPOSITS.REASON_LABEL}:{" "}
              {deposit.retentionReason}
            </span>
          )}
        </li>
      ))}
    </ul>
  );

/**
 * US-ADM-031: los depósitos pendientes (plata de un cliente que la empresa
 * todavía tiene en la mano) y los retenidos (dinero que la empresa se
 * quedó por un daño, con su motivo) — dos listas separadas, leídas
 * directamente de `deposits`.
 */
const DepositsSection = ({
  pendingDeposits,
  retainedDeposits,
}: DepositsSectionProps): JSX.Element => (
  <section className="flex flex-col gap-md rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {REPORTS_SCREEN.DEPOSITS.TITLE}
    </h2>

    <div className="flex flex-col gap-sm">
      <h3 className="font-body-base text-body-base font-semibold text-on-surface">
        {REPORTS_SCREEN.DEPOSITS.PENDING_TITLE}
      </h3>
      <DepositList
        rows={pendingDeposits}
        emptyState={REPORTS_SCREEN.DEPOSITS.EMPTY_PENDING}
        showReason={false}
      />
    </div>

    <div className="flex flex-col gap-sm">
      <h3 className="font-body-base text-body-base font-semibold text-on-surface">
        {REPORTS_SCREEN.DEPOSITS.RETAINED_TITLE}
      </h3>
      <DepositList
        rows={retainedDeposits}
        emptyState={REPORTS_SCREEN.DEPOSITS.EMPTY_RETAINED}
        showReason
      />
    </div>
  </section>
);

export default DepositsSection;
