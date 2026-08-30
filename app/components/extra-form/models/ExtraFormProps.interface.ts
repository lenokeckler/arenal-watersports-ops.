import type { Nullable } from "@/app/types";
import type {
  CompatibilityUnitOption,
  ExtraDetail,
  QuantityCategoryOption,
} from "@/app/utils/administracion/extras";

export interface ExtraFormProps {
  /** The admin's own worker id — `created_by`/`updated_by` on every write. */
  adminWorkerId: string;
  /** `null` for `/administracion/extras/nueva`. */
  extra: Nullable<ExtraDetail>;
  /** Whether `extraHasRecords` already found the extra on a reservation (edit only). */
  hasRecords: boolean;
  /** `by_quantity` categories the extra can occupy (US-ADM-021). */
  quantityCategoryOptions: QuantityCategoryOption[];
  /** Active units for the compatibility checklist (US-ADM-020), edit only. */
  unitOptions: CompatibilityUnitOption[];
}
