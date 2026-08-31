import type { JSX } from "react";
import { OPERATIONS_INVENTORY_SCREEN } from "@/app/constants";
import { formatShortDate } from "@/app/utils/tablero/formatDateTime";
import type { SignedStockMovement } from "@/app/utils/operaciones/inventoryCategory";

interface InventoryMovementHistoryProps {
  movements: SignedStockMovement[];
}

const NO_MOVEMENTS = 0;

const describeChange = (
  movement: SignedStockMovement
): string =>
  `${OPERATIONS_INVENTORY_SCREEN.CATEGORY.AVAILABLE} ${movement.fromAvailable} → ${movement.toAvailable} · ` +
  `${OPERATIONS_INVENTORY_SCREEN.CATEGORY.DAMAGED} ${movement.fromDamaged} → ${movement.toDamaged} · ` +
  `${OPERATIONS_INVENTORY_SCREEN.CATEGORY.IN_REPAIR} ${movement.fromInRepair} → ${movement.toInRepair}`;

/**
 * US-OPE-025: a `by_quantity` category has no ficha to carry its history,
 * so this log is the whole of "cada cambio queda registrado" — from how
 * many to how many, why, when and by whom.
 */
const InventoryMovementHistory = ({
  movements,
}: InventoryMovementHistoryProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {OPERATIONS_INVENTORY_SCREEN.DETAIL.MOVEMENTS.TITLE}
    </h2>

    {movements.length === NO_MOVEMENTS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {OPERATIONS_INVENTORY_SCREEN.DETAIL.MOVEMENTS.EMPTY}
      </p>
    ) : (
      movements.map((movement) => (
        <article
          key={movement.id}
          className="flex flex-col gap-1 rounded-lg border border-white/10 bg-surface-container-low p-sm"
        >
          <span className="font-body-base text-body-base text-on-surface">
            {movement.reason}
          </span>
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {describeChange(movement)}
          </span>
          <span className="font-label-mono text-label-mono text-outline">
            {`${OPERATIONS_INVENTORY_SCREEN.DETAIL.MOVEMENTS.BY(
              movement.authorName
            )} · ${formatShortDate(movement.createdAt)}`}
          </span>
        </article>
      ))
    )}
  </section>
);

export default InventoryMovementHistory;
