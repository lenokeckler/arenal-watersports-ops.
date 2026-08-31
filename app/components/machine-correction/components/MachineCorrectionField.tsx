"use client";

import type { JSX } from "react";
import {
  INPUT_TYPES,
  UNIT_CORRECTION_SCREEN,
} from "@/app/constants";

interface MachineCorrectionFieldProps {
  currentValue: string;
  isBusy: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-white/10 bg-surface-container-low p-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/**
 * One correctable number, with what the ficha says today shown beside it —
 * the operator is fixing a value, so they need to see the one being fixed
 * without it landing inside the box and getting saved by accident.
 */
const MachineCorrectionField = ({
  currentValue,
  isBusy,
  label,
  onChange,
  value,
}: MachineCorrectionFieldProps): JSX.Element => (
  <label className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {label}
    </span>
    <input
      type={INPUT_TYPES.NUMBER}
      value={value}
      disabled={isBusy}
      onChange={(event) => onChange(event.target.value)}
      className={FIELD_CLASS}
    />
    <span className="font-label-mono text-label-mono text-outline">
      {UNIT_CORRECTION_SCREEN.FORM.CURRENT_VALUE(
        currentValue
      )}
    </span>
  </label>
);

export default MachineCorrectionField;
