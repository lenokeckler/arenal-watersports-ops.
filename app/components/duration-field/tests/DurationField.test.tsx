import { useState } from "react";
import type { JSX } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DURATION_PRESET } from "@/app/constants";
import DurationField from "../DurationField";
import { createDurationFieldPage } from "./DurationField.page";

const FIELD_ID = "duration_minutes";
const FIELD_LABEL = "Duración";

interface ControlledDurationFieldProps {
  initialMinutes: number;
}

/**
 * `DurationField` is a controlled component with no state of its own —
 * this wrapper stands in for the caller's own form state, the same
 * contract `ReservationFormDetails` and `AdjustDurationModal` use.
 */
const ControlledDurationField = ({
  initialMinutes,
}: ControlledDurationFieldProps): JSX.Element => {
  const [minutes, setMinutes] = useState(initialMinutes);
  return (
    <DurationField
      id={FIELD_ID}
      isDisabled={false}
      label={FIELD_LABEL}
      name={FIELD_ID}
      onChangeMinutes={setMinutes}
      valueMinutes={minutes}
    />
  );
};

describe("DurationField", () => {
  it("selects a preset, reflecting it in both the free-form field and the caption", async () => {
    render(<ControlledDurationField initialMinutes={60} />);
    const durationFieldPage = createDurationFieldPage();

    await durationFieldPage.selectPreset(
      DURATION_PRESET.THREE_HOURS
    );

    expect(
      durationFieldPage.isPresetSelected(
        DURATION_PRESET.THREE_HOURS
      )
    ).toBe(true);
    expect(
      durationFieldPage.getCustomMinutesInput()
    ).toHaveValue(180);
    expect(
      durationFieldPage.getCaption()
    ).toHaveTextContent("Duración: 3h");
  });

  it("clears the preset highlight and shows a computed label for a custom value", async () => {
    render(<ControlledDurationField initialMinutes={60} />);
    const durationFieldPage = createDurationFieldPage();

    await durationFieldPage.typeCustomMinutes("100");

    expect(
      durationFieldPage.isPresetSelected(
        DURATION_PRESET.ONE_HOUR
      )
    ).toBe(false);
    expect(
      durationFieldPage.getCaption()
    ).toHaveTextContent("Duración: 1h 40m");
  });
});
