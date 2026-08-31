import type { Nullable } from "@/app/types";
import type { UsageMetric } from "@/app/constants";
import type { MaintenanceRecordRow } from "@/app/utils/operaciones/maintenanceRecords";

export interface MachineMaintenanceProps {
  /** Only motorized units can move an oil-change threshold (US-OPE-012). */
  hasMotor: boolean;
  records: MaintenanceRecordRow[];
  unitCode: string;
  unitId: string;
  usageMetric: Nullable<UsageMetric>;
  workerId: string;
}
