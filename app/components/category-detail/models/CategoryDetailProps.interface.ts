import type { CategoryDetail } from "@/app/utils/tablero/categoryDetail";

export interface CategoryDetailProps {
  categoryId: string;
  initialDetail: CategoryDetail;
  /** US-OPE-002 (tablero entry): whoever dispatches from here, for `DispatchModal`. */
  workerId: string;
}
