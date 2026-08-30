import type {
  ExtraListRow,
  ExtrasFilters,
} from "@/app/utils/administracion/extras";

export interface ExtraListProps {
  filters: ExtrasFilters;
  page: number;
  rows: ExtraListRow[];
  totalPages: number;
}
