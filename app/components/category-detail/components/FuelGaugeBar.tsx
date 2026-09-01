import type { JSX } from "react";
import {
  CATEGORY_DETAIL_SCREEN,
  FUEL_LEVEL_PRESET,
  MATERIAL_ICON_NAME,
} from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

const EMPTY_PERCENT = 0;
const FULL_PERCENT = 100;

interface FuelGaugeBarProps {
  percent: number;
}

/**
 * US-OPE-003/US-OPE-010's quarter-tank presets (`FUEL_LEVEL_PRESET`) double
 * as the severity breakpoints here — a quarter tank or less reads `error`,
 * up to half reads `tertiary`, anything past that reads `primary`. Same
 * scale as `FuelLevelPicker`, no new thresholds invented for a read-only
 * gauge.
 */
const resolveFuelFillClass = (percent: number): string => {
  if (percent <= FUEL_LEVEL_PRESET.QUARTER) {
    return "bg-error";
  }
  if (percent <= FUEL_LEVEL_PRESET.HALF) {
    return "bg-tertiary";
  }
  return "bg-primary";
};

/**
 * US-TAB-002: a thin read-only fuel bar for the unit card — glanceable, not
 * editable. `FuelLevelPicker` is the interactive dispatch-time input; this
 * only ever renders `equipment_units.current_fuel`.
 */
const FuelGaugeBar = ({
  percent,
}: FuelGaugeBarProps): JSX.Element => {
  const clampedPercent = Math.min(
    Math.max(percent, EMPTY_PERCENT),
    FULL_PERCENT
  );

  return (
    <div className="flex items-center gap-xs">
      <MaterialIcon
        name={MATERIAL_ICON_NAME.LOCAL_GAS_STATION}
        className="!text-[16px] text-on-surface-variant"
      />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-low">
        <div
          className={`h-full transition-all ${resolveFuelFillClass(clampedPercent)}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {CATEGORY_DETAIL_SCREEN.FUEL_PERCENT(
          clampedPercent
        )}
      </span>
    </div>
  );
};

export default FuelGaugeBar;
