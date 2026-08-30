import type { HistoryFilters, HistoryRow } from "@/app/utils/tablero/history";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface HistoryProps {
  categoryOptions: CategoryOption[];
  filters: HistoryFilters;
  page: number;
  rows: HistoryRow[];
  totalPages: number;
}
