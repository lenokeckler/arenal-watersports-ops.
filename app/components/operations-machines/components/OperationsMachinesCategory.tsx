import type { JSX } from "react";
import type { MachineListCategory } from "@/app/utils/operaciones/machineListGrouping";
import OperationsMachinesUnitCard from "./OperationsMachinesUnitCard";

interface OperationsMachinesCategoryProps {
  category: MachineListCategory;
}

/**
 * One category section of the "Equipos" grid (US-OPE-020) — a heading plus
 * its units. Two columns on mobile already, same as `/tablero`'s own
 * category detail: an image card reads at a glance, so it does not need
 * the full row width a text-only card did.
 */
const OperationsMachinesCategory = ({
  category,
}: OperationsMachinesCategoryProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {category.categoryName}
    </h2>

    <div className="grid grid-cols-2 gap-sm sm:gap-md lg:grid-cols-3 xl:grid-cols-4">
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
