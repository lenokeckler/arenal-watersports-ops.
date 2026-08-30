import type { UsageMetric } from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { UnitDetail } from "@/app/utils/administracion/units";

export interface UnitFormProps {
  /** The admin's own worker id — `created_by`/`updated_by` on every write. */
  adminWorkerId: string;
  categoryId: string;
  consumesFuel: boolean;
  hasMotor: boolean;
  /** `null` for `/administracion/unidades/[categoryId]/nueva`. */
  unit: Nullable<UnitDetail>;
  usageMetric: Nullable<UsageMetric>;
}
