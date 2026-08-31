import type {
  ServiceAlertRow,
  UnitOutOfServiceRow,
} from "@/app/utils/operaciones/maintenanceHub";

export interface MaintenanceHubProps {
  serviceAlerts: ServiceAlertRow[];
  unitsOutOfService: UnitOutOfServiceRow[];
}
