import type { JSX } from "react";
import {
  MAINTENANCE_HUB_SCREEN,
  PATHS,
} from "@/app/constants";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";
import ServiceAlertList from "./components/ServiceAlertList";
import UnitsOutOfServiceList from "./components/UnitsOutOfServiceList";
import type { MaintenanceHubProps } from "./models/MaintenanceHubProps.interface";

/**
 * `/operaciones/mantenimiento` (US-OPE-012, US-OPE-017): what already asks
 * for service and what is out of the water waiting to come back. Server
 * Component end to end — nothing here writes.
 */
const MaintenanceHub = ({
  serviceAlerts,
  unitsOutOfService,
}: MaintenanceHubProps): JSX.Element => (
  <OperationsScreenShell
    backHref={PATHS.OPERATIONS.INVENTORY}
    backLabel={MAINTENANCE_HUB_SCREEN.TITLE}
    subtitle={MAINTENANCE_HUB_SCREEN.SUBTITLE}
    title={MAINTENANCE_HUB_SCREEN.TITLE}
  >
    <ServiceAlertList alerts={serviceAlerts} />
    <UnitsOutOfServiceList units={unitsOutOfService} />
  </OperationsScreenShell>
);

export default MaintenanceHub;
