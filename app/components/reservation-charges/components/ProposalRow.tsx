import type { JSX } from "react";
import { formatAmount } from "@/app/utils/money/formatAmount";
import {
  CURRENCY_LABEL,
  RESERVATION_CHARGES_SCREEN,
  type CurrencyCode,
} from "@/app/constants";
import type { NullableRef } from "@/app/types";

interface ProposalRowProps {
  amount: NullableRef<number>;
  currency: CurrencyCode;
  isBusy: boolean;
  label: string;
  onUse: () => void;
}

/**
 * US-RES-023/US-RES-029: what the catalog suggests, and one tap to take
 * it. When there is no price in this currency the row says so instead of
 * proposing a number nobody agreed on (US-RES-024).
 */
const ProposalRow = ({
  amount,
  currency,
  isBusy,
  label,
  onUse,
}: ProposalRowProps): JSX.Element =>
  amount === null ? (
    <p className="font-label-mono text-label-mono text-on-surface-variant">
      {RESERVATION_CHARGES_SCREEN.CHARGE_FORM.NO_PROPOSAL}
    </p>
  ) : (
    <div className="flex items-center justify-between gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-2">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {label}
      </span>
      <div className="flex items-center gap-sm">
        <span className="font-label-mono text-label-mono text-primary">
          {CURRENCY_LABEL[currency]}
          {formatAmount(amount)}
        </span>
        <button
          type="button"
          disabled={isBusy}
          onClick={onUse}
          className="min-h-12 rounded-lg border border-primary/40 px-sm font-button text-button uppercase text-primary disabled:opacity-60"
        >
          {
            RESERVATION_CHARGES_SCREEN.CHARGE_FORM
              .USE_PROPOSAL
          }
        </button>
      </div>
    </div>
  );

export default ProposalRow;
