import type { JSX } from "react";
import {
  OPERATIONS_INVENTORY_SCREEN,
  PATHS,
  TRACKING_MODE,
  TRACKING_MODE_LABEL,
} from "@/app/constants";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";
import InventoryCategoryStock from "./InventoryCategoryStock";
import InventoryCategoryUnits from "./InventoryCategoryUnits";
import InventoryMovementHistory from "./components/InventoryMovementHistory";
import type { InventoryCategoryProps } from "./models/InventoryCategoryProps.interface";

/**
 * `/operaciones/inventario/[categoryId]` (US-OPE-021, US-OPE-022,
 * US-OPE-025). A Server Component that picks the half matching the
 * category's modality: fichas one by one, or quantities per state with the
 * movement log underneath.
 */
const InventoryCategory = ({
  detail,
  workerId,
}: InventoryCategoryProps): JSX.Element => (
  <OperationsScreenShell
    backHref={PATHS.OPERATIONS.INVENTORY}
    backLabel={OPERATIONS_INVENTORY_SCREEN.TITLE}
    subtitle={TRACKING_MODE_LABEL[detail.trackingMode]}
    title={detail.categoryName}
  >
    {detail.trackingMode === TRACKING_MODE.BY_UNIT ? (
      <InventoryCategoryUnits
        units={detail.units}
        workerId={workerId}
      />
    ) : (
      <>
        {detail.stock ? (
          <InventoryCategoryStock
            categoryId={detail.categoryId}
            stock={detail.stock}
            workerId={workerId}
          />
        ) : (
          <p className="font-body-base text-body-base text-on-surface-variant">
            {
              OPERATIONS_INVENTORY_SCREEN.DETAIL
                .STOCK_MISSING
            }
          </p>
        )}
        <InventoryMovementHistory
          movements={detail.movements}
        />
      </>
    )}
  </OperationsScreenShell>
);

export default InventoryCategory;
