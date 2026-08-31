import type { UsageMetric } from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { UnitListRow } from "@/app/utils/administracion/units";

export interface UnitListProps {
  categoryId: string;
  categoryName: string;
  hasMotor: boolean;
  rows: UnitListRow[];
  usageMetric: Nullable<UsageMetric>;
}
