import { useState } from "react";
import type { JSX } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Nullable } from "@/app/types";
import FuelLevelPicker from "../FuelLevelPicker";
import { createFuelLevelPickerPage } from "./FuelLevelPicker.page";

const MAX = 4;

interface ControlledFuelLevelPickerProps {
  initialLevel: Nullable<number>;
  max: number;
}

/**
 * `FuelLevelPicker` is a controlled component with no state of its own —
 * this wrapper stands in for the caller's own form state, the same
 * contract `EquipmentReadingRow` and `MachineCorrectionFuelField` use.
 */
const ControlledFuelLevelPicker = ({
  initialLevel,
  max,
}: ControlledFuelLevelPickerProps): JSX.Element => {
  const [level, setLevel] =
    useState<Nullable<number>>(initialLevel);
  return (
    <FuelLevelPicker
      isDisabled={false}
      max={max}
      onSelect={setLevel}
      selectedLevel={level}
    />
  );
};

describe("FuelLevelPicker", () => {
  it("renders one tappable line per unit of fuelMax", () => {
    render(
      <ControlledFuelLevelPicker
        initialLevel={null}
        max={MAX}
      />
    );
    const fuelLevelPickerPage = createFuelLevelPickerPage();

    for (let line = 1; line <= MAX; line += 1) {
      expect(
        fuelLevelPickerPage.getLineButton(line, MAX)
      ).toBeInTheDocument();
    }
  });

  it("fills every line up to and including the one tapped", async () => {
    render(
      <ControlledFuelLevelPicker
        initialLevel={null}
        max={MAX}
      />
    );
    const fuelLevelPickerPage = createFuelLevelPickerPage();

    await fuelLevelPickerPage.selectLine(3, MAX);

    expect(fuelLevelPickerPage.isLineFilled(1, MAX)).toBe(
      true
    );
    expect(fuelLevelPickerPage.isLineFilled(3, MAX)).toBe(
      true
    );
    expect(fuelLevelPickerPage.isLineFilled(4, MAX)).toBe(
      false
    );
  });

  it("leaves every line unfilled when no reading was ever taken", () => {
    render(
      <ControlledFuelLevelPicker
        initialLevel={null}
        max={MAX}
      />
    );
    const fuelLevelPickerPage = createFuelLevelPickerPage();

    expect(fuelLevelPickerPage.isLineFilled(1, MAX)).toBe(
      false
    );
  });
});
