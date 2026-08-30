export interface PaginationProps {
  onPageChange: (page: number) => void;
  page: number;
  totalPages: number;
}
