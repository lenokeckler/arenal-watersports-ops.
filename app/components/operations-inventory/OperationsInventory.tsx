import type { JSX } from "react";
import {
  OPERATIONS_INVENTORY_SCREEN,
  PATHS,
} from "@/app/constants";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";
import InventoryCategoryCard from "./components/InventoryCategoryCard";
import OperationsInventoryLinks from "./components/OperationsInventoryLinks";
import type { OperationsInventoryProps } from "./models/OperationsInventoryProps.interface";

const NO_CATEGORIES = 0;

/**
 * `/operaciones/inventario` (US-OPE-021): the single registry of
 * everything the company owns — jet skis and boats included — seen
 * category by category. Server Component: nothing on this screen writes.
 */
const OperationsInventory = ({
  alertsCount,
  categories,
}: OperationsInventoryProps): JSX.Element => (
  <OperationsScreenShell
    backHref={PATHS.OPERATIONS.ROOT}
    backLabel={OPERATIONS_INVENTORY_SCREEN.TITLE}
    subtitle={OPERATIONS_INVENTORY_SCREEN.SUBTITLE}
    title={OPERATIONS_INVENTORY_SCREEN.TITLE}
  >
    <OperationsInventoryLinks alertsCount={alertsCount} />

    {categories.length === NO_CATEGORIES ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {OPERATIONS_INVENTORY_SCREEN.EMPTY}
      </p>
    ) : (
      <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
        {categories.map((category) => (
          <InventoryCategoryCard
            key={category.categoryId}
            category={category}
          />
        ))}
      </div>
    )}
  </OperationsScreenShell>
);

export default OperationsInventory;
