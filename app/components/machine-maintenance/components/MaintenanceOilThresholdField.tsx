"use client";

import type { JSX } from "react";
import {
  INPUT_TYPES,
  MAINTENANCE_RECORD_SCREEN,
} from "@/app/constants";

interface MaintenanceOilThresholdFieldProps {
  isBusy: boolean;
  onChange: (value: string) => void;
  value: string;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/**
 * US-OPE-012 closed from the other end: the alert fires when
 * `usage_total` reaches `next_oil_change_at`, so unless the oil change
 * that answered it also moves the threshold, the same machine keeps
 * asking forever. Left blank, nothing moves.
 */
const MaintenanceOilThresholdField = ({
  isBusy,
  onChange,
  value,
}: MaintenanceOilThresholdFieldProps): JSX.Element => (
  <label className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {MAINTENANCE_RECORD_SCREEN.FORM.NEXT_OIL_CHANGE_LABEL}
    </span>
    <input
      type={INPUT_TYPES.NUMBER}
      value={value}
      disabled={isBusy}
      onChange={(event) => onChange(event.target.value)}
      className={FIELD_CLASS}
    />
    <span className="font-label-mono text-label-mono text-outline">
      {MAINTENANCE_RECORD_SCREEN.FORM.NEXT_OIL_CHANGE_HELP}
    </span>
  </label>
);

export default MaintenanceOilThresholdField;
