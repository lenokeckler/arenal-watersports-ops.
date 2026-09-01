import type { JSX } from "react";
import type { MachineListCategory } from "@/app/utils/operaciones/machineListGrouping";
import OperationsMachinesUnitCard from "./OperationsMachinesUnitCard";

interface OperationsMachinesCategoryProps {
  category: MachineListCategory;
}

/**
 * One category section of the "Equipos" list (US-OPE-020) — a heading plus
 * its units. One column on mobile: each unit card already carries a fuel
 * gauge, a usage reading and up to two badges, too dense to also halve its
 * width the way the board's own image tiles do.
 */
const OperationsMachinesCategory = ({
  category,
}: OperationsMachinesCategoryProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {category.categoryName}
    </h2>

    <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
      {category.units.map((unit) => (
        <OperationsMachinesUnitCard
          key={unit.id}
          unit={unit}
        />
      ))}
    </div>
  </section>
);

export default OperationsMachinesCategory;
