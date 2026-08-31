import type { JSX } from "react";
import {
  MAINTENANCE_HUB_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
  USAGE_METRIC_LABEL,
} from "@/app/constants";
import type { ServiceAlertRow } from "@/app/utils/operaciones/maintenanceHub";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface ServiceAlertListProps {
  alerts: ServiceAlertRow[];
}

const NO_ALERTS = 0;

const CARD_CLASS =
  "flex min-h-14 items-center gap-sm rounded-lg border border-error/40 bg-error/10 px-sm py-sm";

/**
 * US-OPE-012: the machines that already reached the threshold on their own
 * ficha. `remaining_usage` comes out of the view negative once it is past,
 * so the excess is read straight off it.
 */
const ServiceAlertList = ({
  alerts,
}: ServiceAlertListProps): JSX.Element => (
  <section className="flex flex-col gap-sm">
    <h2 className="font-title-md text-title-md text-on-surface">
      {MAINTENANCE_HUB_SCREEN.SERVICE_ALERTS.TITLE}
    </h2>

    {alerts.length === NO_ALERTS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {MAINTENANCE_HUB_SCREEN.SERVICE_ALERTS.EMPTY}
      </p>
    ) : (
      alerts.map((alert) => (
        <Link
          key={alert.unitId}
          href={PATHS.OPERATIONS.MACHINE_DETAIL(
            alert.unitId
          )}
          className={CARD_CLASS}
        >
          <MaterialIcon
            name={MATERIAL_ICON_NAME.OIL_BARREL}
            className="text-error"
          />
          <div className="flex flex-col">
            <span className="font-body-base text-body-base text-on-surface">
              {`${alert.code} · ${alert.categoryName}`}
            </span>
            <span className="font-label-mono text-label-mono text-error">
              {MAINTENANCE_HUB_SCREEN.SERVICE_ALERTS.OVERDUE(
                String(Math.abs(alert.remainingUsage)),
                alert.usageMetric
                  ? USAGE_METRIC_LABEL[
                      alert.usageMetric
                    ].toLowerCase()
                  : MAINTENANCE_HUB_SCREEN.SERVICE_ALERTS
                      .TITLE
              )}
            </span>
          </div>
          <MaterialIcon
            name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
            className="ml-auto text-on-surface-variant"
          />
        </Link>
      ))
    )}
  </section>
);

export default ServiceAlertList;
