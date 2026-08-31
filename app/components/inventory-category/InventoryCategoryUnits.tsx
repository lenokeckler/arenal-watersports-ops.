"use client";

import type { JSX } from "react";
import type { InventoryUnitRow } from "@/app/utils/operaciones/inventoryCategory";
import InventoryUnitList from "./components/InventoryUnitList";
import { useUnitStatusMarkingViewModel } from "./hooks/useUnitStatusMarkingViewModel";

interface InventoryCategoryUnitsProps {
  units: InventoryUnitRow[];
  workerId: string;
}

/**
 * The `by_unit` half of `/operaciones/inventario/[categoryId]`
 * (US-OPE-021, US-OPE-022). Split from the `by_quantity` half because the
 * two modalities are two different writes — a status per ficha against a
 * signed quantity movement — and a hook cannot live behind a branch.
 */
const InventoryCategoryUnits = ({
  units,
  workerId,
}: InventoryCategoryUnitsProps): JSX.Element => {
  const viewModel = useUnitStatusMarkingViewModel(workerId);

  return (
    <InventoryUnitList
      {...viewModel}
      units={units}
    />
  );
};

export default InventoryCategoryUnits;
