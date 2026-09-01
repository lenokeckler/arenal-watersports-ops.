"use client";

import type { JSX } from "react";
import {
  EDITABLE_UNIT_STATUSES,
  UNIT_STATUS_LABEL,
  type UnitStatus,
} from "@/app/constants";

interface CountSheetUnitRowProps {
  code: string;
  isBusy: boolean;
  onStatusChange: (status: UnitStatus) => void;
  status: UnitStatus;
}

const OPTION_CLASS =
  "min-h-12 rounded-lg border px-sm font-button text-button uppercase transition-colors disabled:opacity-60";

/**
 * US-OPE-023: "en las categorías identificadas una por una se confirma
 * cada unidad y su estado". The state starts on what the system holds, so
 * confirming an unchanged unit is one tap on the category, not one per
 * ficha.
 */
const CountSheetUnitRow = ({
  code,
  isBusy,
  onStatusChange,
  status,
}: CountSheetUnitRowProps): JSX.Element => (
  <div className="flex flex-col gap-1 border-t border-outline-variant pt-sm">
    <span className="font-body-base text-body-base text-on-surface">
      {code}
    </span>
    <div className="flex flex-wrap gap-sm">
      {EDITABLE_UNIT_STATUSES.map((option) => (
        <button
          key={option}
          type="button"
          disabled={isBusy}
          onClick={() => onStatusChange(option)}
          className={`${OPTION_CLASS} ${
            option === status
              ? "border-primary bg-primary/15 text-primary"
              : "border-outline-variant text-on-surface-variant hover:border-primary/40"
          }`}
        >
          {UNIT_STATUS_LABEL[option]}
        </button>
      ))}
    </div>
  </div>
);

export default CountSheetUnitRow;
