"use client";

import type { JSX } from "react";
import {
  INPUT_TYPES,
  MAINTENANCE_RECORD_SCREEN,
  MAINTENANCE_WORK_TYPE,
  MAINTENANCE_WORK_TYPE_PRESETS,
} from "@/app/constants";

interface MaintenanceWorkTypePickerProps {
  isBusy: boolean;
  onOtherWorkTypeChange: (value: string) => void;
  onWorkTypeChange: (value: string) => void;
  otherWorkType: string;
  workType: string;
}

const OPTION_CLASS =
  "min-h-12 rounded-lg border px-sm font-button text-button uppercase transition-colors disabled:opacity-60";
const FIELD_CLASS =
  "w-full rounded-lg border border-white/10 bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/**
 * US-OPE-018: the jobs the dock repeats, as one-tap options, plus `Otro`
 * for "todo lo que se le haga al equipo" — the column is free text in the
 * database for exactly that reason.
 */
const MaintenanceWorkTypePicker = ({
  isBusy,
  onOtherWorkTypeChange,
  onWorkTypeChange,
  otherWorkType,
  workType,
}: MaintenanceWorkTypePickerProps): JSX.Element => (
  <div className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {MAINTENANCE_RECORD_SCREEN.FORM.WORK_TYPE_LABEL}
    </span>
    <div className="flex flex-wrap gap-sm">
      {MAINTENANCE_WORK_TYPE_PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          disabled={isBusy}
          onClick={() => onWorkTypeChange(preset)}
          className={`${OPTION_CLASS} ${
            preset === workType
              ? "border-primary bg-primary/15 text-primary"
              : "border-white/10 text-on-surface-variant hover:border-primary/40"
          }`}
        >
          {preset}
        </button>
      ))}
    </div>

    {workType === MAINTENANCE_WORK_TYPE.OTHER && (
      <label className="mt-1 flex flex-col gap-1">
        <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
          {
            MAINTENANCE_RECORD_SCREEN.FORM
              .WORK_TYPE_OTHER_LABEL
          }
        </span>
        <input
          type={INPUT_TYPES.TEXT}
          value={otherWorkType}
          disabled={isBusy}
          placeholder={
            MAINTENANCE_RECORD_SCREEN.FORM
              .WORK_TYPE_OTHER_PLACEHOLDER
          }
          onChange={(event) =>
            onOtherWorkTypeChange(event.target.value)
          }
          className={FIELD_CLASS}
        />
      </label>
    )}
  </div>
);

export default MaintenanceWorkTypePicker;
