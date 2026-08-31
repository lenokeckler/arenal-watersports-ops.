import type { UnitDamageReportRow } from "@/app/utils/operaciones/unitDamageReports";

export interface MachineDamageProps {
  impactCount: number;
  reports: UnitDamageReportRow[];
  unitCode: string;
  unitId: string;
  workerId: string;
}
