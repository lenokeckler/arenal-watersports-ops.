import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  EQUIPMENT_UNIT_STATUS,
  USAGE_METRIC,
} from "@/app/constants";
import type { CategoryDetailUnit } from "@/app/utils/tablero/categoryDetail";
import UnitCard from "../components/UnitCard";
import type { UnitCardProps } from "../components/UnitCardProps.interface";
import { createUnitCardPage } from "./UnitCard.page";

const MAX_FUEL = 4;
const NOW = Date.now();

const buildUnit = (
  overrides: Partial<CategoryDetailUnit>
): CategoryDetailUnit => ({
  code: "JS-01",
  customerName: null,
  effectiveStatus: EQUIPMENT_UNIT_STATUS.AVAILABLE,
  fuelLevel: null,
  fuelMax: MAX_FUEL,
  id: "unit-1",
  imageAlt: "Jet ski",
  imageSrc: null,
  imageTreatment: null,
  reservationCode: null,
  reservationId: null,
  returnsAt: null,
  usageMetric: null,
  usageTotal: null,
  ...overrides,
});

const buildProps = (
  overrides: Partial<UnitCardProps>
): UnitCardProps => ({
  isSelectable: false,
  isSelected: false,
  now: NOW,
  onToggleSelect: vi.fn(),
  unit: buildUnit({}),
  ...overrides,
});

describe("UnitCard", () => {
  it("shows the fuel gauge marked as unread for a category that consumes fuel but has no reading", () => {
    render(
      <UnitCard
        {...buildProps({
          unit: buildUnit({
            fuelLevel: null,
            fuelMax: MAX_FUEL,
          }),
        })}
      />
    );
    const unitCardPage = createUnitCardPage();

    expect(
      unitCardPage.getFuelNoReadingText()
    ).toBeInTheDocument();
  });

  it("shows the fuel gauge with its numeric reading once one exists", () => {
    render(
      <UnitCard
        {...buildProps({
          unit: buildUnit({
            fuelLevel: 2,
            fuelMax: MAX_FUEL,
          }),
        })}
      />
    );
    const unitCardPage = createUnitCardPage();

    expect(
      unitCardPage.getFuelReadingText(2, MAX_FUEL)
    ).toBeInTheDocument();
  });

  it("never shows the fuel gauge for a category that does not consume fuel", () => {
    render(
      <UnitCard
        {...buildProps({
          unit: buildUnit({
            fuelLevel: null,
            fuelMax: null,
          }),
        })}
      />
    );
    const unitCardPage = createUnitCardPage();

    expect(
      unitCardPage.queryFuelNoReadingText()
    ).not.toBeInTheDocument();
  });

  it("shows the usage reading for a category that tracks engine hours", () => {
    render(
      <UnitCard
        {...buildProps({
          unit: buildUnit({
            usageMetric: USAGE_METRIC.ENGINE_HOURS,
            usageTotal: 222,
          }),
        })}
      />
    );
    const unitCardPage = createUnitCardPage();

    expect(
      unitCardPage.getUsageReadingText(
        USAGE_METRIC.ENGINE_HOURS,
        222
      )
    ).toBeInTheDocument();
  });

  it("never shows a usage reading for a category with no motor", () => {
    render(
      <UnitCard
        {...buildProps({
          unit: buildUnit({
            usageMetric: null,
            usageTotal: null,
          }),
        })}
      />
    );
    const unitCardPage = createUnitCardPage();

    expect(
      unitCardPage.queryUsageReadingText(
        USAGE_METRIC.ENGINE_HOURS,
        222
      )
    ).not.toBeInTheDocument();
  });

  it("becomes a tap target only once operaciones can dispatch from it", () => {
    render(
      <UnitCard
        {...buildProps({
          isSelectable: true,
          unit: buildUnit({ code: "JS-02" }),
        })}
      />
    );
    const unitCardPage = createUnitCardPage();

    expect(
      unitCardPage.getSelectButton("JS-02")
    ).toBeInTheDocument();
  });

  it("is not a tap target when the unit is not selectable", () => {
    render(
      <UnitCard {...buildProps({ isSelectable: false })} />
    );
    const unitCardPage = createUnitCardPage();

    expect(
      unitCardPage.queryButton()
    ).not.toBeInTheDocument();
  });
});
