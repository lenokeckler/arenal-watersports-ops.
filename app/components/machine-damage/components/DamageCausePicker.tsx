"use client";

import type { JSX } from "react";
import {
  DAMAGE_CAUSE,
  DAMAGE_CAUSE_LABEL,
  DAMAGE_REPORTS_SCREEN,
  type DamageCause,
} from "@/app/constants";
import type { Nullable } from "@/app/types";

interface DamageCausePickerProps {
  isBusy: boolean;
  onCauseChange: (cause: DamageCause) => void;
  selectedCause: Nullable<DamageCause>;
}

const OPTION_CLASS =
  "min-h-12 rounded-lg border px-sm font-button text-button uppercase transition-colors disabled:opacity-60";

/**
 * US-OPE-013: "la causa se elige entre vuelco, choque, falla de máquina u
 * otra" — four big targets rather than a dropdown, because this gets
 * tapped standing on the dock with one wet hand (RNF-040).
 */
const DamageCausePicker = ({
  isBusy,
  onCauseChange,
  selectedCause,
}: DamageCausePickerProps): JSX.Element => (
  <div className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {DAMAGE_REPORTS_SCREEN.FORM.CAUSE_LABEL}
    </span>
    <div className="flex flex-wrap gap-sm">
      {Object.values(DAMAGE_CAUSE).map((cause) => (
        <button
          key={cause}
          type="button"
          disabled={isBusy}
          onClick={() => onCauseChange(cause)}
          className={`${OPTION_CLASS} ${
            cause === selectedCause
              ? "border-primary bg-primary/15 text-primary"
              : "border-outline-variant text-on-surface-variant hover:border-primary/40"
          }`}
        >
          {DAMAGE_CAUSE_LABEL[cause]}
        </button>
      ))}
    </div>
  </div>
);

export default DamageCausePicker;
