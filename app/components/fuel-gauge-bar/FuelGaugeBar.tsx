import type { JSX } from "react";
import {
  CATEGORY_DETAIL_SCREEN,
  MATERIAL_ICON_NAME,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

const EMPTY_LEVEL = 0;
const FIRST_LINE = 1;
const LOW_FUEL_FRACTION = 0.25;
const MEDIUM_FUEL_FRACTION = 0.5;
const UNFILLED_LINE_CLASS = "bg-surface-container-low";

interface FuelGaugeBarProps {
  /** `null` is "never read" (`equipment_units.fuel_level`), not empty. */
  level: Nullable<number>;
  max: number;
}

const buildLines = (max: number): number[] =>
  Array.from(
    { length: max },
    (_, index) => index + FIRST_LINE
  );

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
 * US-TAB-002: a thin read-only fuel gauge — glanceable, not editable, one
 * line per line the unit's own gauge physically has
 * (`docs/decisiones/vista_mobile3.png`), same segmented read as the
 * interactive `FuelLevelPicker` this mirrors. `FuelLevelPicker` is the
 * dispatch-time input; this only ever renders
 * `equipment_units.fuel_level`/`fuel_max`. Promoted out of `category-detail`
 * once `/operaciones/maquinas` (US-OPE-020) became a second consumer.
 *
 * `level: null` renders every line unfilled with `FUEL_NO_READING`, distinct
 * from `level: 0`'s `FUEL_LEVEL(0, max)` — the fuel line comment on the
 * column itself says it best: "nulo es sin lectura todavia, no vacio".
 * Whether to show this component at all when there is no reading is the
 * caller's call, not this one's: `/operaciones/maquinas` — the screen an
 * operator opens specifically to take a unit's first reading — always
 * renders it, while `/tablero`'s own `UnitCard` still hides it entirely, on
 * purpose, for a screen meant to be read at a glance rather than acted on.
 */
const FuelGaugeBar = ({
  level,
  max,
}: FuelGaugeBarProps): JSX.Element => {
  const hasReading = typeof level === "number";
  const clampedLevel = hasReading
    ? Math.min(Math.max(level, EMPTY_LEVEL), max)
    : EMPTY_LEVEL;
  const fillClass = hasReading
    ? resolveFuelFillClass(clampedLevel, max)
    : UNFILLED_LINE_CLASS;

  return (
    <div className="flex items-center gap-xs">
      <MaterialIcon
        name={MATERIAL_ICON_NAME.LOCAL_GAS_STATION}
        className="!text-[16px] text-on-surface-variant"
      />
      <div
        aria-hidden
        className="flex flex-1 gap-0.5"
      >
        {buildLines(max).map((line) => (
          <span
            key={line}
            className={`h-1.5 flex-1 rounded-sm transition-colors ${
              hasReading && line <= clampedLevel
                ? fillClass
                : UNFILLED_LINE_CLASS
            }`}
          />
        ))}
      </div>
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {hasReading
          ? CATEGORY_DETAIL_SCREEN.FUEL_LEVEL(
              clampedLevel,
              max
            )
          : CATEGORY_DETAIL_SCREEN.FUEL_NO_READING}
      </span>
    </div>
  );
};

export default FuelGaugeBar;
