import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import type { CurrencySummaryRow } from "@/app/utils/reservas/reservationMoneySummary";
import ChargesSection from "./ChargesSection";
import ChargeSummaryCard from "./ChargeSummaryCard";

interface ChargeSummarySectionProps {
  isMixedCurrency: boolean;
  isSplitChild: boolean;
  rows: CurrencySummaryRow[];
}

const NO_ROWS = 0;

/**
 * US-RES-026: "la reserva muestra cuánto se ha cobrado y cuánto falta" —
 * per currency, with the two notices that explain why a figure may look
 * odd: a reservation born from a split carries no tariff of its own
 * (US-RES-019), and a payment split across currencies cannot be netted
 * against the other one (US-RES-025).
 */
const ChargeSummarySection = ({
  isMixedCurrency,
  isSplitChild,
  rows,
}: ChargeSummarySectionProps): JSX.Element => (
  <ChargesSection
    icon={MATERIAL_ICON_NAME.ATTACH_MONEY}
    title={RESERVATION_CHARGES_SCREEN.SUMMARY.TITLE}
  >
    {isSplitChild && (
      <p className="rounded-lg border border-primary/20 bg-primary/10 p-sm font-body-base text-[14px] leading-tight text-on-surface">
        {RESERVATION_CHARGES_SCREEN.SPLIT_CHILD_NOTICE}
      </p>
    )}
    {rows.length === NO_ROWS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {RESERVATION_CHARGES_SCREEN.SUMMARY.EMPTY}
      </p>
    ) : (
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        {rows.map((row) => (
          <ChargeSummaryCard
            key={row.currency}
            row={row}
          />
        ))}
      </div>
    )}
    {isMixedCurrency && (
      <p className="font-label-mono text-label-mono text-on-surface-variant">
        {
          RESERVATION_CHARGES_SCREEN.SUMMARY
            .MIXED_CURRENCY_NOTICE
        }
      </p>
    )}
  </ChargesSection>
);

export default ChargeSummarySection;
