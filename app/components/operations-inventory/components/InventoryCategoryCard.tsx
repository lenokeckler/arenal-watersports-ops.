import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  OPERATIONS_INVENTORY_SCREEN,
  PATHS,
  TRACKING_MODE,
  TRACKING_MODE_LABEL,
} from "@/app/constants";
import type { InventorySummaryRow } from "@/app/utils/operaciones/inventorySummary";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface InventoryCategoryCardProps {
  category: InventorySummaryRow;
}

const CARD_CLASS =
  "flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md";

/**
 * US-OPE-021: how many there are and in what state, the same way for a
 * category tracked one by one and for one tracked by quantity —
 * `inventory_category_summary` already normalised both.
 */
const InventoryCategoryCard = ({
  category,
}: InventoryCategoryCardProps): JSX.Element => (
  <Link
    href={PATHS.OPERATIONS.INVENTORY_CATEGORY(
      category.categoryId
    )}
    className={CARD_CLASS}
  >
    <header className="flex items-center gap-sm">
      <span className="font-title-md text-title-md text-on-surface">
        {category.categoryName}
      </span>
      <MaterialIcon
        name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
        className="ml-auto text-on-surface-variant"
      />
    </header>

    <div className="flex flex-wrap gap-sm">
      <Badge className="border-primary/40 text-primary">
        {`${OPERATIONS_INVENTORY_SCREEN.CATEGORY.AVAILABLE}: ${category.quantityAvailable}`}
      </Badge>
      <Badge className="border-error/40 text-error">
        {`${OPERATIONS_INVENTORY_SCREEN.CATEGORY.DAMAGED}: ${category.quantityDamaged}`}
      </Badge>
      <Badge className="border-white/10 text-on-surface-variant">
        {`${OPERATIONS_INVENTORY_SCREEN.CATEGORY.IN_REPAIR}: ${category.quantityInRepair}`}
      </Badge>
      {category.trackingMode === TRACKING_MODE.BY_UNIT && (
        <Badge className="border-white/10 text-on-surface-variant">
          {`${OPERATIONS_INVENTORY_SCREEN.CATEGORY.IN_MAINTENANCE}: ${category.quantityInMaintenance}`}
        </Badge>
      )}
    </div>

    <footer className="flex items-center gap-sm font-label-mono text-label-mono uppercase text-outline">
      <span>
        {TRACKING_MODE_LABEL[category.trackingMode]}
      </span>
      <span className="ml-auto">
        {`${OPERATIONS_INVENTORY_SCREEN.CATEGORY.TOTAL}: ${category.quantityTotal}`}
      </span>
    </footer>
  </Link>
);

export default InventoryCategoryCard;
