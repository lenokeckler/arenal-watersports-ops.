import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FuelGaugeBar from "../FuelGaugeBar";
import { createFuelGaugeBarPage } from "./FuelGaugeBar.page";

const MAX = 4;

describe("FuelGaugeBar", () => {
  it("shows the numeric reading when the unit has a fuel level", () => {
    render(
      <FuelGaugeBar
        level={3}
        max={MAX}
      />
    );
    const fuelGaugeBarPage = createFuelGaugeBarPage();

    expect(
      fuelGaugeBarPage.getReadingText(3, MAX)
    ).toBeInTheDocument();
  });

  it("distinguishes a reading of zero from a level that was never read", () => {
    render(
      <FuelGaugeBar
        level={0}
        max={MAX}
      />
    );
    const fuelGaugeBarPage = createFuelGaugeBarPage();

    expect(
      fuelGaugeBarPage.getReadingText(0, MAX)
    ).toBeInTheDocument();
  });

  it("marks the gauge as unread instead of hiding it when level is null", () => {
    render(
      <FuelGaugeBar
        level={null}
        max={MAX}
      />
    );
    const fuelGaugeBarPage = createFuelGaugeBarPage();

    expect(
      fuelGaugeBarPage.getNoReadingText()
    ).toBeInTheDocument();
  });
});
