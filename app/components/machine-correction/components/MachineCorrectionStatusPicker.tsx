"use client";

import type { JSX } from "react";
import {
  EDITABLE_UNIT_STATUSES,
  UNIT_CORRECTION_SCREEN,
  UNIT_STATUS_LABEL,
  type UnitStatus,
} from "@/app/constants";
import type { Nullable } from "@/app/types";

interface MachineCorrectionStatusPickerProps {
  currentStatus: UnitStatus;
  isBusy: boolean;
  onStatusChange: (status: Nullable<UnitStatus>) => void;
  selectedStatus: Nullable<UnitStatus>;
}

const OPTION_CLASS =
  "min-h-12 rounded-lg border px-sm font-button text-button uppercase transition-colors disabled:opacity-60";

const optionClassName = (isSelected: boolean): string =>
  `${OPTION_CLASS} ${
    isSelected
      ? "border-primary bg-primary/15 text-primary"
      : "border-outline-variant text-on-surface-variant hover:border-primary/40"
  }`;

/**
 * US-OPE-020 and US-OPE-022 share the same four states. "Dejarlo como
 * está" is a real option and the default: a correction that only touches
 * the fuel must not silently rewrite the status too.
 */
const MachineCorrectionStatusPicker = ({
  currentStatus,
  isBusy,
  onStatusChange,
  selectedStatus,
}: MachineCorrectionStatusPickerProps): JSX.Element => (
  <div className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {UNIT_CORRECTION_SCREEN.FORM.STATUS_LABEL}
    </span>
    <div className="flex flex-wrap gap-sm">
      <button
        type="button"
        disabled={isBusy}
        onClick={() => onStatusChange(null)}
        className={optionClassName(selectedStatus === null)}
      >
        {UNIT_CORRECTION_SCREEN.FORM.KEEP_STATUS}
      </button>
      {EDITABLE_UNIT_STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          disabled={isBusy}
          onClick={() => onStatusChange(status)}
          className={optionClassName(
            selectedStatus === status
          )}
        >
          {UNIT_STATUS_LABEL[status]}
        </button>
      ))}
    </div>
    <span className="font-label-mono text-label-mono text-outline">
      {UNIT_CORRECTION_SCREEN.FORM.CURRENT_VALUE(
        UNIT_STATUS_LABEL[currentStatus]
      )}
    </span>
  </div>
);

export default MachineCorrectionStatusPicker;
