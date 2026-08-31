import type { Nullable } from "@/app/types";
import type { CategoryDetail } from "@/app/utils/administracion/categories";

export interface CategoryFormProps {
  /** The admin's own worker id — `created_by`/`updated_by` on every write. */
  adminWorkerId: string;
  /** `null` for `/administracion/categorias/nueva`. */
  category: Nullable<CategoryDetail>;
  /** Whether `categoryHasRecords` already found units or stock (edit only). */
  hasRecords: boolean;
}
