import type { Nullable } from "@/app/types";
import type {
  StockDetail,
  StockMovementRow,
} from "@/app/utils/administracion/stock";

export interface StockFormProps {
  /** The admin's own worker id — `updated_by`/`created_by` on every write. */
  adminWorkerId: string;
  categoryId: string;
  movements: StockMovementRow[];
  /** `null` for a category whose stock row was never provisioned. */
  stock: Nullable<StockDetail>;
}
