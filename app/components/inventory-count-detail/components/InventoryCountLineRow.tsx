import type { JSX } from "react";
import {
  INVENTORY_COUNT_SCREEN,
  UNIT_STATUS_LABEL,
} from "@/app/constants";
import type { InventoryCountLineRow as CountLine } from "@/app/utils/operaciones/inventoryCountDetail";
import Badge from "@/app/components/badge/Badge";

interface InventoryCountLineRowProps {
  line: CountLine;
}

const NO_QUANTITY = 0;

const ROW_CLASS =
  "flex flex-wrap items-center gap-sm rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm";

/**
 * One line of a count. `count_line_is_one_shape` guarantees exactly one of
 * the two halves is filled, so the row shows a confirmed ficha or three
 * quantities, never a blend of both.
 */
const InventoryCountLineRow = ({
  line,
}: InventoryCountLineRowProps): JSX.Element => (
  <article className={ROW_CLASS}>
    <span className="font-body-base text-body-base text-on-surface">
      {line.unitCode ?? line.categoryName}
    </span>

    {line.unitCode && (
      <span className="font-label-mono text-label-mono uppercase text-outline">
        {line.categoryName}
      </span>
    )}

    {line.confirmedStatus ? (
      <Badge className="ml-auto border-white/10 text-on-surface-variant">
        {UNIT_STATUS_LABEL[line.confirmedStatus]}
      </Badge>
    ) : (
      <span className="ml-auto font-label-mono text-label-mono text-on-surface-variant">
        {INVENTORY_COUNT_SCREEN.DETAIL.BY_QUANTITY(
          line.quantityAvailable ?? NO_QUANTITY,
          line.quantityDamaged ?? NO_QUANTITY,
          line.quantityInRepair ?? NO_QUANTITY
        )}
      </span>
    )}
  </article>
);

export default InventoryCountLineRow;
