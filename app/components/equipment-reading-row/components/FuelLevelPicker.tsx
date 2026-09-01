import type { JSX } from "react";
import {
  FUEL_LEVEL_PRESET,
  FUEL_LEVEL_PRESET_LABEL,
  FUEL_LEVEL_PRESET_ORDER,
  type FuelLevelPreset,
} from "@/app/constants";
import type { Nullable } from "@/app/types";

interface FuelLevelPickerProps {
  isDisabled: boolean;
  onSelect: (level: FuelLevelPreset) => void;
  selectedLevel: Nullable<number>;
}

const GAUGE_WIDTH_CLASS: Record<FuelLevelPreset, string> = {
  [FUEL_LEVEL_PRESET.QUARTER]: "w-1/4",
  [FUEL_LEVEL_PRESET.HALF]: "w-1/2",
  [FUEL_LEVEL_PRESET.THREE_QUARTERS]: "w-3/4",
  [FUEL_LEVEL_PRESET.FULL]: "w-full",
};

const GAUGE_FILL_CLASS: Record<FuelLevelPreset, string> = {
  [FUEL_LEVEL_PRESET.QUARTER]: "bg-error",
  [FUEL_LEVEL_PRESET.HALF]: "bg-tertiary",
  [FUEL_LEVEL_PRESET.THREE_QUARTERS]: "bg-primary",
  [FUEL_LEVEL_PRESET.FULL]: "bg-primary",
};

/**
 * US-OPE-003/US-OPE-010: the quarter-tank shortcuts next to the exact
 * numeric field — big enough to tap with a wet thumb on the dock. Selecting
 * one only sets the value `onFuelChange` already accepts; the numeric field
 * stays the source of truth for anything that is not exactly a quarter.
 */
const FuelLevelPicker = ({
  isDisabled,
  onSelect,
  selectedLevel,
}: FuelLevelPickerProps): JSX.Element => (
  <div className="grid grid-cols-4 gap-2">
    {FUEL_LEVEL_PRESET_ORDER.map((level) => {
      const isSelected = selectedLevel === level;
      return (
        <button
          key={level}
          type="button"
          aria-pressed={isSelected}
          disabled={isDisabled}
          onClick={() => onSelect(level)}
          className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isSelected
              ? "border-primary bg-primary-container/20"
              : "border-white/10 bg-surface-container-high hover:bg-surface-variant"
          }`}
        >
          <span className="h-4 w-8 overflow-hidden rounded-sm border border-outline">
            <span
              className={`block h-full ${GAUGE_WIDTH_CLASS[level]} ${GAUGE_FILL_CLASS[level]}`}
            />
          </span>
          <span
            className={`font-label-mono text-label-mono ${
              isSelected
                ? "font-bold text-primary"
                : "text-on-surface"
            }`}
          >
            {FUEL_LEVEL_PRESET_LABEL[level]}
          </span>
        </button>
      );
    })}
  </div>
);

export default FuelLevelPicker;
