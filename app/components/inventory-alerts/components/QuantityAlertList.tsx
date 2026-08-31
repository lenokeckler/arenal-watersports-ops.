import type { JSX } from "react";
import {
  INVENTORY_ALERTS_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import type { QuantityAlertRow } from "@/app/utils/operaciones/inventoryAlerts";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface QuantityAlertListProps {
  alerts: QuantityAlertRow[];
}

const NO_ALERTS = 0;

const CARD_CLASS =
  "flex min-h-14 items-center gap-sm rounded-lg border border-error/40 bg-error/10 px-sm py-sm";

/**
 * US-OPE-026: only the categories administración configured with a minimum
 * ever reach this list — `inventory_quantity_alerts` filters on
 * `alert_min_quantity is not null`, so a category without one never warns
 * just because it hit zero.
 */
const QuantityAlertList = ({
  alerts,
}: QuantityAlertListProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {INVENTORY_ALERTS_SCREEN.QUANTITY.TITLE}
    </h2>

    {alerts.length === NO_ALERTS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {INVENTORY_ALERTS_SCREEN.QUANTITY.EMPTY}
      </p>
    ) : (
      alerts.map((alert) => (
        <Link
          key={alert.categoryId}
          href={PATHS.OPERATIONS.INVENTORY_CATEGORY(
            alert.categoryId
          )}
          className={CARD_CLASS}
        >
          <MaterialIcon
            name={MATERIAL_ICON_NAME.TRENDING_DOWN}
            className="text-error"
          />
          <div className="flex flex-col">
            <span className="font-body-base text-body-base text-on-surface">
              {alert.categoryName}
            </span>
            <span className="font-label-mono text-label-mono text-on-surface-variant">
              {INVENTORY_ALERTS_SCREEN.QUANTITY.CURRENT(
                alert.quantityAvailable,
                alert.alertMinQuantity
              )}
            </span>
          </div>
          <span className="ml-auto font-label-mono text-label-mono uppercase text-error">
            {INVENTORY_ALERTS_SCREEN.QUANTITY.MISSING(
              alert.missingQuantity
            )}
          </span>
        </Link>
      ))
    )}
  </section>
);

export default QuantityAlertList;
