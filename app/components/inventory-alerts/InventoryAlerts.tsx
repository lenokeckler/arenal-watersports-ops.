import type { JSX } from "react";
import {
  INVENTORY_ALERTS_SCREEN,
  PATHS,
} from "@/app/constants";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";
import ExpiryAlertList from "./components/ExpiryAlertList";
import QuantityAlertList from "./components/QuantityAlertList";
import type { InventoryAlertsProps } from "./models/InventoryAlertsProps.interface";

/**
 * `/operaciones/avisos` (US-OPE-026, US-OPE-027). Server Component: both
 * lists come out of views that already applied the category's own
 * configuration.
 */
const InventoryAlerts = ({
  alerts,
}: InventoryAlertsProps): JSX.Element => (
  <OperationsScreenShell
    backHref={PATHS.OPERATIONS.INVENTORY}
    backLabel={INVENTORY_ALERTS_SCREEN.TITLE}
    subtitle={INVENTORY_ALERTS_SCREEN.SUBTITLE}
    title={INVENTORY_ALERTS_SCREEN.TITLE}
  >
    <QuantityAlertList alerts={alerts.quantity} />
    <ExpiryAlertList alerts={alerts.expiry} />
  </OperationsScreenShell>
);

export default InventoryAlerts;
