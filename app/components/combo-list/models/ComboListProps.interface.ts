import type {
  CombosFilters,
  ComboListRow,
} from "@/app/utils/administracion/combos";

export interface ComboListProps {
  filters: CombosFilters;
  page: number;
  rows: ComboListRow[];
  totalPages: number;
}
