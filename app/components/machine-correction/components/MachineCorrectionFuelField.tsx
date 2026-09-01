import type { JSX } from "react";
import {
  STRING,
  UNIT_CORRECTION_SCREEN,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import FuelLevelPicker from "@/app/components/fuel-level-picker/FuelLevelPicker";

interface MachineCorrectionFuelFieldProps {
  currentFuelLevel: Nullable<number>;
  fuelMax: number;
  isBusy: boolean;
  onSelect: (level: number) => void;
  selectedLevel: Nullable<number>;
}

/**
 * US-OPE-020: taps a line the same way the dispatch/close screens do
 * (`FuelLevelPicker`), against the ficha's current `fuelMax` — correcting
 * the max itself is `MachineCorrectionField`'s "Líneas máx" box, a separate
 * value from what line is selected today.
 */
const MachineCorrectionFuelField = ({
  currentFuelLevel,
  fuelMax,
  isBusy,
  onSelect,
  selectedLevel,
}: MachineCorrectionFuelFieldProps): JSX.Element => (
  <div className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {UNIT_CORRECTION_SCREEN.FORM.FUEL_LABEL}
    </span>
    <FuelLevelPicker
      isDisabled={isBusy}
      max={fuelMax}
      onSelect={onSelect}
      selectedLevel={selectedLevel}
    />
    <span className="font-label-mono text-label-mono text-outline">
      {UNIT_CORRECTION_SCREEN.FORM.CURRENT_VALUE(
        currentFuelLevel === null
          ? STRING.N_A
          : `${currentFuelLevel}/${fuelMax}`
      )}
    </span>
  </div>
);

export default MachineCorrectionFuelField;
