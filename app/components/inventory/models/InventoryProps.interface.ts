import type { InventoryFilters, InventoryRow } from "@/app/utils/tablero/inventory";

export interface InventoryProps {
  filters: InventoryFilters;
  page: number;
  rows: InventoryRow[];
  totalPages: number;
}
