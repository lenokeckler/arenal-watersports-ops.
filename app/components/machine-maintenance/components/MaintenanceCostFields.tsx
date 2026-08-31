"use client";

import type { JSX } from "react";
import {
  CURRENCY_LABEL,
  INPUT_TYPES,
  MAINTENANCE_RECORD_SCREEN,
  type CurrencyCode,
} from "@/app/constants";

interface MaintenanceCostFieldsProps {
  costAmount: string;
  costCurrency: CurrencyCode;
  isBusy: boolean;
  isExternal: boolean;
  onCostAmountChange: (value: string) => void;
  onCostCurrencyChange: (value: CurrencyCode) => void;
  onExternalToggle: () => void;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-white/10 bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const CURRENCY_CLASS =
  "min-h-12 w-16 rounded-lg border font-button text-button uppercase transition-colors disabled:opacity-60";

/**
 * `is_external` says who did the job and `cost_amount` says what it cost;
 * the schema keeps them independent on purpose — the crew charges no
 * labour, but a new hull guard was still bought and is still this
 * machine's expense.
 */
const MaintenanceCostFields = ({
  costAmount,
  costCurrency,
  isBusy,
  isExternal,
  onCostAmountChange,
  onCostCurrencyChange,
  onExternalToggle,
}: MaintenanceCostFieldsProps): JSX.Element => (
  <>
    <label className="flex min-h-12 items-center gap-sm">
      <input
        type={INPUT_TYPES.CHECKBOX}
        checked={isExternal}
        disabled={isBusy}
        onChange={onExternalToggle}
        className="h-6 w-6 accent-primary"
      />
      <span className="font-body-base text-body-base text-on-surface">
        {MAINTENANCE_RECORD_SCREEN.FORM.EXTERNAL_LABEL}
      </span>
    </label>

    <div className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
        {MAINTENANCE_RECORD_SCREEN.FORM.COST_LABEL}
      </span>
      <div className="flex gap-sm">
        {MAINTENANCE_RECORD_SCREEN.CURRENCIES.map(
          (currency) => (
            <button
              key={currency}
              type="button"
              disabled={isBusy}
              onClick={() => onCostCurrencyChange(currency)}
              className={`${CURRENCY_CLASS} ${
                currency === costCurrency
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-white/10 text-on-surface-variant"
              }`}
            >
              {CURRENCY_LABEL[currency]}
            </button>
          )
        )}
        <input
          type={INPUT_TYPES.NUMBER}
          value={costAmount}
          disabled={isBusy}
          placeholder={
            MAINTENANCE_RECORD_SCREEN.FORM.COST_PLACEHOLDER
          }
          onChange={(event) =>
            onCostAmountChange(event.target.value)
          }
          className={FIELD_CLASS}
        />
      </div>
    </div>
  </>
);

export default MaintenanceCostFields;
