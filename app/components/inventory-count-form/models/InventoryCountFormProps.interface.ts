import type { CountSheetCategory } from "@/app/utils/operaciones/inventoryCountSheet";

export interface InventoryCountFormProps {
  categories: CountSheetCategory[];
  workerId: string;
}
