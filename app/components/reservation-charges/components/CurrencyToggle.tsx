import type { JSX } from "react";
import {
  CURRENCY_CODE,
  CURRENCY_LABEL,
  type CurrencyCode,
} from "@/app/constants";

interface CurrencyToggleProps {
  isBusy: boolean;
  label: string;
  onChange: (currency: CurrencyCode) => void;
  value: CurrencyCode;
}

const OPTION_CLASS =
  "min-h-12 flex-1 rounded-lg border px-sm font-button text-button uppercase transition-colors disabled:opacity-60";

/**
 * US-RES-025: dollars or colones, and the movement is stored in the one
 * it came in. The system converts nothing, so this is a choice, never a
 * conversion.
 */
const CurrencyToggle = ({
  isBusy,
  label,
  onChange,
  value,
}: CurrencyToggleProps): JSX.Element => (
  <div className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {label}
    </span>
    <div className="flex gap-sm">
      {Object.values(CURRENCY_CODE).map((currency) => (
        <button
          key={currency}
          type="button"
          disabled={isBusy}
          onClick={() => onChange(currency)}
          className={`${OPTION_CLASS} ${
            currency === value
              ? "border-primary bg-primary/15 text-primary"
              : "border-outline-variant text-on-surface-variant hover:border-primary/40"
          }`}
        >
          {CURRENCY_LABEL[currency]} {currency}
        </button>
      ))}
    </div>
  </div>
);

export default CurrencyToggle;
