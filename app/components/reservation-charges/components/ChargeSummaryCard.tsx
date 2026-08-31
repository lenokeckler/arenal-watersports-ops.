import type { JSX } from "react";
import { formatAmount } from "@/app/utils/money/formatAmount";
import {
  CURRENCY_LABEL,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import type { NullableRef } from "@/app/types";
import type { CurrencySummaryRow } from "@/app/utils/reservas/reservationMoneySummary";

interface ChargeSummaryCardProps {
  row: CurrencySummaryRow;
}

const NO_AMOUNT_TEXT = "—";
const SummaryLine = ({
  label,
  value,
}: {
  label: string;
  value: NullableRef<number>;
}): JSX.Element => (
  <span className="flex justify-between font-body-base text-body-base text-on-surface-variant">
    {label}
    <span>
      {value === null
        ? NO_AMOUNT_TEXT
        : formatAmount(value)}
    </span>
  </span>
);

/**
 * US-RES-025/US-RES-026: one card per currency — what was agreed, what
 * has been charged, what is still missing. Never a merged total: the
 * system has no exchange rate. The pending figure only measures the
 * tariff, because extra time is charged "aparte de la tarifa"
 * (US-RES-031).
 */
const ChargeSummaryCard = ({
  row,
}: ChargeSummaryCardProps): JSX.Element => (
  <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-surface-container-low p-sm">
    <span className="font-title-md text-title-md text-primary">
      {CURRENCY_LABEL[row.currency]}
      {row.currency}
    </span>
    <SummaryLine
      label={RESERVATION_CHARGES_SCREEN.SUMMARY.LIST}
      value={row.listAmount}
    />
    <SummaryLine
      label={RESERVATION_CHARGES_SCREEN.SUMMARY.AGREED}
      value={row.agreedAmount}
    />
    <SummaryLine
      label={RESERVATION_CHARGES_SCREEN.SUMMARY.CHARGED}
      value={row.chargedTariff}
    />
    <SummaryLine
      label={RESERVATION_CHARGES_SCREEN.SUMMARY.EXTRA_TIME}
      value={row.chargedExtraTime}
    />
    <SummaryLine
      label={RESERVATION_CHARGES_SCREEN.SUMMARY.REFUNDED}
      value={row.refundedAmount}
    />
    <SummaryLine
      label={RESERVATION_CHARGES_SCREEN.SUMMARY.PENDING}
      value={row.pendingAmount}
    />
    <span className="flex justify-between border-t border-white/10 pt-1 font-title-md text-title-md text-on-surface">
      {RESERVATION_CHARGES_SCREEN.SUMMARY.NET}
      <span>{formatAmount(row.netAmount)}</span>
    </span>
  </div>
);

export default ChargeSummaryCard;
