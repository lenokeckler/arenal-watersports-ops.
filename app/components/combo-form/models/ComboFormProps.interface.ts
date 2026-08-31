import type { Nullable } from "@/app/types";
import type {
  ComboCategoryOption,
  ComboDetail,
} from "@/app/utils/administracion/combos";

export interface ComboFormProps {
  /** The admin's own worker id — `created_by`/`updated_by` on every write. */
  adminWorkerId: string;
  /** Every active category a combo item can reference. */
  categoryOptions: ComboCategoryOption[];
  /** `null` for `/administracion/combos/nueva`. */
  combo: Nullable<ComboDetail>;
  /** Whether `comboHasRecords` already found the combo on a reservation (edit only). */
  hasRecords: boolean;
}
