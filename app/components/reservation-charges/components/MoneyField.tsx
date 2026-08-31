import type { JSX } from "react";
import { INPUT_TYPES } from "@/app/constants";
import type { Nullable } from "@/app/types";

interface MoneyFieldProps {
  error?: Nullable<string>;
  isBusy: boolean;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-white/10 bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** A labelled numeric field for an amount or a percentage, with its error underneath. */
const MoneyField = ({
  error,
  isBusy,
  label,
  onChange,
  placeholder,
  value,
}: MoneyFieldProps): JSX.Element => (
  <label className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {label}
    </span>
    <input
      type={INPUT_TYPES.NUMBER}
      inputMode="decimal"
      value={value}
      disabled={isBusy}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={FIELD_CLASS}
    />
    {error && (
      <span className="font-label-mono text-label-mono text-error">
        {error}
      </span>
    )}
  </label>
);

export default MoneyField;
