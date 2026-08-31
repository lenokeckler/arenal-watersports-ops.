import type {
  CategoriesFilters,
  CategoryListRow,
} from "@/app/utils/administracion/categories";

export interface CategoryListProps {
  filters: CategoriesFilters;
  page: number;
  rows: CategoryListRow[];
  totalPages: number;
}
