"use client";

import type { JSX } from "react";
import {
  CURRENCY_LABEL,
  MATERIAL_ICON_NAME,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import { useRefundFormViewModel } from "../hooks/useRefundFormViewModel";
import type { ReservationChargesProps } from "../models/ReservationChargesProps.interface";
import ChargesSection from "./ChargesSection";
import CurrencyToggle from "./CurrencyToggle";
import MoneyField from "./MoneyField";
import SubmitRow from "./SubmitRow";

type RefundSectionProps = Pick<
  ReservationChargesProps,
  "context" | "movements" | "workerId"
> & { onSaved: () => void };

const AMOUNT_DECIMALS = 2;
const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-white/10 bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const TEXTAREA_ROWS = 2;

/**
 * US-RES-028: reservas states the percentage returned and the system
 * turns it into the amount that comes off the day's income. No money
 * actually moves here — how much to give back is decided outside the
 * application — this only leaves the record.
 */
const RefundSection = (
  props: RefundSectionProps
): JSX.Element => {
  const viewModel = useRefundFormViewModel(props);

  return (
    <ChargesSection
      icon={MATERIAL_ICON_NAME.UNDO}
      title={RESERVATION_CHARGES_SCREEN.REFUND.TITLE}
    >
      <CurrencyToggle
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.REFUND.CURRENCY_LABEL
        }
        onChange={viewModel.handleCurrencyChange}
        value={viewModel.currency}
      />
      <MoneyField
        error={viewModel.errors.percentage}
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.REFUND.PERCENTAGE_LABEL
        }
        onChange={viewModel.handlePercentageChange}
        value={viewModel.percentage}
      />
      <p className="flex justify-between font-label-mono text-label-mono text-on-surface-variant">
        {RESERVATION_CHARGES_SCREEN.REFUND.AMOUNT_PREVIEW}
        <span className="text-primary">
          {CURRENCY_LABEL[viewModel.currency]}
          {viewModel.computedAmount.toFixed(
            AMOUNT_DECIMALS
          )}
        </span>
      </p>
      <label className="flex flex-col gap-1">
        <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
          {RESERVATION_CHARGES_SCREEN.REFUND.REASON_LABEL}
        </span>
        <textarea
          rows={TEXTAREA_ROWS}
          value={viewModel.reason}
          disabled={viewModel.isBusy}
          placeholder={
            RESERVATION_CHARGES_SCREEN.REFUND
              .REASON_PLACEHOLDER
          }
          onChange={(event) =>
            viewModel.handleReasonChange(event.target.value)
          }
          className={TEXTAREA_CLASS}
        />
        {viewModel.errors.reason && (
          <span className="font-label-mono text-label-mono text-error">
            {viewModel.errors.reason}
          </span>
        )}
      </label>
      <p className="font-label-mono text-label-mono text-on-surface-variant">
        {RESERVATION_CHARGES_SCREEN.REFUND.HINT}
      </p>
      <SubmitRow
        error={viewModel.submitError}
        isBusy={viewModel.isBusy}
        label={RESERVATION_CHARGES_SCREEN.REFUND.SUBMIT}
        onSubmit={viewModel.handleSubmit}
      />
    </ChargesSection>
  );
};

export default RefundSection;
