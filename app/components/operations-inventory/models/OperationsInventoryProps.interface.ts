import type { InventorySummaryRow } from "@/app/utils/operaciones/inventorySummary";

export interface OperationsInventoryProps {
  alertsCount: number;
  categories: InventorySummaryRow[];
}
