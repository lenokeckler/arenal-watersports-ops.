import type { JSX } from "react";
import {
  INVENTORY_ALERTS_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import { formatCalendarDate } from "@/app/utils/tablero/formatDateTime";
import type { ExpiryAlertRow } from "@/app/utils/operaciones/inventoryAlerts";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface ExpiryAlertListProps {
  alerts: ExpiryAlertRow[];
}

const NO_ALERTS = 0;
const TODAY = 0;

const CARD_CLASS =
  "flex min-h-14 items-center gap-sm rounded-lg border px-sm py-sm";

const describeDeadline = (
  alert: ExpiryAlertRow
): string => {
  if (alert.daysToExpiry === TODAY) {
    return INVENTORY_ALERTS_SCREEN.EXPIRY.TODAY;
  }

  return alert.isExpired
    ? INVENTORY_ALERTS_SCREEN.EXPIRY.EXPIRED(
        Math.abs(alert.daysToExpiry)
      )
    : INVENTORY_ALERTS_SCREEN.EXPIRY.REMAINING(
        alert.daysToExpiry
      );
};

/**
 * US-OPE-027: "la anticipación del aviso sale de la configuración de la
 * categoría" — `inventory_expiry_alerts` compares against
 * `alert_expiry_days` on the category itself, so nothing here decides how
 * early is early enough.
 */
const ExpiryAlertList = ({
  alerts,
}: ExpiryAlertListProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {INVENTORY_ALERTS_SCREEN.EXPIRY.TITLE}
    </h2>

    {alerts.length === NO_ALERTS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {INVENTORY_ALERTS_SCREEN.EXPIRY.EMPTY}
      </p>
    ) : (
      alerts.map((alert) => (
        <Link
          key={alert.categoryId}
          href={PATHS.OPERATIONS.INVENTORY_CATEGORY(
            alert.categoryId
          )}
          className={`${CARD_CLASS} ${
            alert.isExpired
              ? "border-error/40 bg-error/10"
              : "border-white/10 bg-surface-container-low"
          }`}
        >
          <MaterialIcon
            name={MATERIAL_ICON_NAME.EVENT_BUSY}
            className={
              alert.isExpired
                ? "text-error"
                : "text-on-surface-variant"
            }
          />
          <div className="flex flex-col">
            <span className="font-body-base text-body-base text-on-surface">
              {alert.categoryName}
            </span>
            <span className="font-label-mono text-label-mono text-outline">
              {formatCalendarDate(alert.expiryDate)}
            </span>
          </div>
          <span
            className={`ml-auto font-label-mono text-label-mono uppercase ${
              alert.isExpired
                ? "text-error"
                : "text-on-surface-variant"
            }`}
          >
            {describeDeadline(alert)}
          </span>
        </Link>
      ))
    )}
  </section>
);

export default ExpiryAlertList;
