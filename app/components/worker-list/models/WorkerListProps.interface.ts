import type {
  WorkersFilters,
  WorkerListRow,
} from "@/app/utils/administracion/workers";

export interface WorkerListProps {
  filters: WorkersFilters;
  page: number;
  rows: WorkerListRow[];
  totalPages: number;
}
