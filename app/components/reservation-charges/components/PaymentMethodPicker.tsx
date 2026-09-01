import type { JSX } from "react";
import {
  INPUT_TYPES,
  PAYMENT_METHOD,
  PAYMENT_METHOD_PRESETS,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import type { Nullable } from "@/app/types";

interface PaymentMethodPickerProps {
  error: Nullable<string>;
  isBusy: boolean;
  method: string;
  onMethodChange: (value: string) => void;
  onOtherMethodChange: (value: string) => void;
  otherMethod: string;
}

const OPTION_CLASS =
  "min-h-12 rounded-lg border px-sm font-button text-button uppercase transition-colors disabled:opacity-60";
const FIELD_CLASS =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/**
 * US-RES-027: cash, card, PayPal, SINPE or anything else, as plain text.
 * The system never processes a payment nor validates a card — it keeps
 * the record, not the money.
 */
const PaymentMethodPicker = ({
  error,
  isBusy,
  method,
  onMethodChange,
  onOtherMethodChange,
  otherMethod,
}: PaymentMethodPickerProps): JSX.Element => (
  <div className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {RESERVATION_CHARGES_SCREEN.CHARGE_FORM.METHOD_LABEL}
    </span>
    <div className="flex flex-wrap gap-sm">
      {PAYMENT_METHOD_PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          disabled={isBusy}
          onClick={() => onMethodChange(preset)}
          className={`${OPTION_CLASS} ${
            preset === method
              ? "border-primary bg-primary/15 text-primary"
              : "border-outline-variant text-on-surface-variant hover:border-primary/40"
          }`}
        >
          {preset}
        </button>
      ))}
    </div>
    {method === PAYMENT_METHOD.OTHER && (
      <label className="mt-1 flex flex-col gap-1">
        <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
          {
            RESERVATION_CHARGES_SCREEN.CHARGE_FORM
              .METHOD_OTHER_LABEL
          }
        </span>
        <input
          type={INPUT_TYPES.TEXT}
          value={otherMethod}
          disabled={isBusy}
          placeholder={
            RESERVATION_CHARGES_SCREEN.CHARGE_FORM
              .METHOD_OTHER_PLACEHOLDER
          }
          onChange={(event) =>
            onOtherMethodChange(event.target.value)
          }
          className={FIELD_CLASS}
        />
      </label>
    )}
    {error && (
      <span className="font-label-mono text-label-mono text-error">
        {error}
      </span>
    )}
  </div>
);

export default PaymentMethodPicker;
