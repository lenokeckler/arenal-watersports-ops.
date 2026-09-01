import type { JSX } from "react";
import {
  OPERATIONS_MACHINES_SCREEN,
  PATHS,
} from "@/app/constants";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";
import OperationsMachinesCategory from "./components/OperationsMachinesCategory";
import type { OperationsMachinesProps } from "./models/OperationsMachinesProps.interface";

const NO_CATEGORIES = 0;

/**
 * `/operaciones/maquinas` (US-OPE-020): where "Equipos" now lives — the
 * machines that get corrected outside a dispatch, grouped by category, one
 * tap away from the correction form. Server Component: nothing on this
 * screen writes.
 */
const OperationsMachines = ({
  categories,
}: OperationsMachinesProps): JSX.Element => (
  <OperationsScreenShell
    backHref={PATHS.OPERATIONS.ROOT}
    backLabel={OPERATIONS_MACHINES_SCREEN.TITLE}
    subtitle={OPERATIONS_MACHINES_SCREEN.SUBTITLE}
    title={OPERATIONS_MACHINES_SCREEN.TITLE}
  >
    {categories.length === NO_CATEGORIES ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {OPERATIONS_MACHINES_SCREEN.EMPTY}
      </p>
    ) : (
      categories.map((category) => (
        <OperationsMachinesCategory
          key={category.categoryId}
          category={category}
        />
      ))
    )}
  </OperationsScreenShell>
);

export default OperationsMachines;
