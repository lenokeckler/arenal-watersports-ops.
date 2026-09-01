import type { CategoryDetail } from "@/app/utils/tablero/categoryDetail";

export interface CategoryDetailViewModel {
  detail: CategoryDetail;
  /** `Date.now()`, ticking — drives every unit card's "libre en X min". */
  now: number;
}
