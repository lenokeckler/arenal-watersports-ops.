import type { JSX } from "react";
import { CATEGORY_DETAIL_SCREEN } from "@/app/constants";
import type { CategoryDetailStock } from "@/app/utils/tablero/categoryDetail";

interface QuantityTilesProps {
  stock: CategoryDetailStock;
}

/**
 * A by_quantity category has no per-unit record (section 4.1 of the data
 * model design) — just counts by state, read from `equipment_stock`.
 */
const QuantityTiles = ({ stock }: QuantityTilesProps): JSX.Element => (
  <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
    <div className="rounded-xl border border-primary/30 bg-primary/10 p-lg text-center">
      <p className="font-display-lg text-display-lg text-primary">
        {stock.available}
      </p>
      <p className="font-body-base text-body-base text-on-surface-variant">
        {CATEGORY_DETAIL_SCREEN.QUANTITY_AVAILABLE}
      </p>
    </div>
    <div className="rounded-xl border border-error/30 bg-error/10 p-lg text-center">
      <p className="font-display-lg text-display-lg text-error">
        {stock.damaged}
      </p>
      <p className="font-body-base text-body-base text-on-surface-variant">
        {CATEGORY_DETAIL_SCREEN.DAMAGED}
      </p>
    </div>
    <div className="rounded-xl border border-outline-variant bg-surface-variant p-lg text-center">
      <p className="font-display-lg text-display-lg text-on-surface">
        {stock.inRepair}
      </p>
      <p className="font-body-base text-body-base text-on-surface-variant">
        {CATEGORY_DETAIL_SCREEN.IN_REPAIR}
      </p>
    </div>
  </div>
);

export default QuantityTiles;
