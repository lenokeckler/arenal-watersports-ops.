import type { JSX } from "react";
import {
  CATEGORY_DETAIL_SCREEN,
  MATERIAL_ICON_NAME,
} from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

const EMPTY_LEVEL = 0;
const FULL_WIDTH_PERCENT = 100;
const LOW_FUEL_FRACTION = 0.25;
const MEDIUM_FUEL_FRACTION = 0.5;

interface FuelGaugeBarProps {
  level: number;
  max: number;
}

/**
 * A quarter of the gauge's own lines or less reads `error`, up to half
 * reads `tertiary`, anything past that reads `primary` — same three tiers
 * `FuelLevelPicker` used to key off `FUEL_LEVEL_PRESET`, now scaled to each
 * unit's own `max` instead of a fixed 0-100 percentage.
 */
const resolveFuelFillClass = (
  level: number,
  max: number
): string => {
  if (level <= max * LOW_FUEL_FRACTION) {
    return "bg-error";
  }
  if (level <= max * MEDIUM_FUEL_FRACTION) {
    return "bg-tertiary";
  }
  return "bg-primary";
};

/**
 * US-TAB-002: a thin read-only fuel bar for the unit card — glanceable, not
 * editable. `FuelLevelPicker` is the interactive dispatch-time input; this
 * only ever renders `equipment_units.fuel_level`/`fuel_max`.
 */
const FuelGaugeBar = ({
  level,
  max,
}: FuelGaugeBarProps): JSX.Element => {
  const clampedLevel = Math.min(
    Math.max(level, EMPTY_LEVEL),
    max
  );
  const widthPercent =
    (clampedLevel / max) * FULL_WIDTH_PERCENT;

  return (
    <div className="flex items-center gap-xs">
      <MaterialIcon
        name={MATERIAL_ICON_NAME.LOCAL_GAS_STATION}
        className="!text-[16px] text-on-surface-variant"
      />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-low">
        <div
          className={`h-full transition-all ${resolveFuelFillClass(clampedLevel, max)}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {CATEGORY_DETAIL_SCREEN.FUEL_LEVEL(
          clampedLevel,
          max
        )}
      </span>
    </div>
  );
};

export default FuelGaugeBar;
