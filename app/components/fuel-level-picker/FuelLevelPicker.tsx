import type { JSX } from "react";
import { FUEL_LEVEL_PICKER_SCREEN } from "@/app/constants";
import type { Nullable } from "@/app/types";

interface FuelLevelPickerProps {
  isDisabled: boolean;
  /** Cuantas lineas tiene el medidor de esta unidad. */
  max: number;
  onSelect: (level: number) => void;
  selectedLevel: Nullable<number>;
}

const FIRST_LINE = 1;

const buildLines = (max: number): number[] =>
  Array.from(
    { length: max },
    (_, index) => index + FIRST_LINE
  );

/**
 * US-OPE-003/US-OPE-010: `max` tappable lines, one per line the unit's own
 * gauge physically has (`docs/decisiones/vista_mobile4.png`) — tapping the
 * third line sets the reading to 3 of `max`. Big enough to hit with a wet
 * thumb on the dock; the numeric field next to it stays the way to reach 0,
 * which no line taps to.
 */
const FuelLevelPicker = ({
  isDisabled,
  max,
  onSelect,
  selectedLevel,
}: FuelLevelPickerProps): JSX.Element => (
  <div className="flex gap-1">
    {buildLines(max).map((line) => {
      const isFilled =
        typeof selectedLevel === "number" &&
        line <= selectedLevel;
      return (
        <button
          key={line}
          type="button"
          aria-pressed={isFilled}
          aria-label={FUEL_LEVEL_PICKER_SCREEN.LINE_LABEL(
            line,
            max
          )}
          disabled={isDisabled}
          onClick={() => onSelect(line)}
          className={`h-10 flex-1 rounded-sm border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isFilled
              ? "border-primary bg-primary"
              : "border-outline-variant bg-surface-container-high hover:bg-surface-variant"
          }`}
        />
      );
    })}
  </div>
);

export default FuelLevelPicker;
