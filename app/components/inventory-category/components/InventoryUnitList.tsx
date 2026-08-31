"use client";

import type { JSX } from "react";
import { OPERATIONS_INVENTORY_SCREEN } from "@/app/constants";
import type { InventoryUnitRow } from "@/app/utils/operaciones/inventoryCategory";
import type { UnitStatusMarkingViewModel } from "../hooks/useUnitStatusMarkingViewModel";
import InventoryUnitCard from "./InventoryUnitCard";

interface InventoryUnitListProps extends UnitStatusMarkingViewModel {
  units: InventoryUnitRow[];
}

const NO_UNITS = 0;

/**
 * US-OPE-021: "al entrar a una categoría identificada una por una se ven
 * sus unidades con su código y su estado".
 */
const InventoryUnitList = ({
  busyUnitId,
  error,
  handleStatusChange,
  units,
}: InventoryUnitListProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {OPERATIONS_INVENTORY_SCREEN.DETAIL.UNITS_TITLE}
    </h2>

    {error && (
      <p className="font-label-mono text-label-mono text-error">
        {error}
      </p>
    )}

    {units.length === NO_UNITS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {OPERATIONS_INVENTORY_SCREEN.DETAIL.UNITS_EMPTY}
      </p>
    ) : (
      units.map((unit) => (
        <InventoryUnitCard
          key={unit.id}
          isBusy={busyUnitId === unit.id}
          onStatusChange={handleStatusChange}
          unit={unit}
        />
      ))
    )}
  </section>
);

export default InventoryUnitList;
