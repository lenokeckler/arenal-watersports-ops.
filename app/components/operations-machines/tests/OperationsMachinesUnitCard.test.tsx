import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UNIT_STATUS } from "@/app/constants";
import type { MachineListCategoryUnit } from "@/app/utils/operaciones/machineListGrouping";
import OperationsMachinesUnitCard from "../components/OperationsMachinesUnitCard";
import { createOperationsMachinesUnitCardPage } from "./OperationsMachinesUnitCard.page";

const MAX_FUEL = 4;

const buildUnit = (
  overrides: Partial<MachineListCategoryUnit>
): MachineListCategoryUnit => ({
  code: "CUAD-01",
  consumesFuel: true,
  fuelLevel: null,
  fuelMax: MAX_FUEL,
  hasMotor: true,
  id: "unit-1",
  imageAlt: "Cuadraciclo",
  imageSrc: null,
  imageTreatment: null,
  impactCount: 0,
  isOilChangeDue: false,
  status: UNIT_STATUS.AVAILABLE,
  usageMetric: null,
  usageTotal: 0,
  ...overrides,
});

describe("OperationsMachinesUnitCard", () => {
  it("shows the fuel gauge marked as unread for a unit never measured", () => {
    render(
      <OperationsMachinesUnitCard
        unit={buildUnit({ fuelLevel: null })}
      />
    );
    const operationsMachinesUnitCardPage =
      createOperationsMachinesUnitCardPage();

    expect(
      operationsMachinesUnitCardPage.getNoReadingText()
    ).toBeInTheDocument();
  });

  it("shows the fuel gauge with its numeric reading once one exists", () => {
    render(
      <OperationsMachinesUnitCard
        unit={buildUnit({ fuelLevel: 2 })}
      />
    );
    const operationsMachinesUnitCardPage =
      createOperationsMachinesUnitCardPage();

    expect(
      operationsMachinesUnitCardPage.getReadingText(
        2,
        MAX_FUEL
      )
    ).toBeInTheDocument();
  });

  it("never shows the fuel gauge for a unit that does not consume fuel", () => {
    render(
      <OperationsMachinesUnitCard
        unit={buildUnit({
          consumesFuel: false,
          fuelLevel: null,
        })}
      />
    );
    const operationsMachinesUnitCardPage =
      createOperationsMachinesUnitCardPage();

    expect(
      operationsMachinesUnitCardPage.queryNoReadingText()
    ).not.toBeInTheDocument();
  });
});
