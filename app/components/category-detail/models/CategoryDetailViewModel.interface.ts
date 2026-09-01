import type { CategoryDetail } from "@/app/utils/tablero/categoryDetail";
import type { UseUnitDispatchViewModelReturn } from "../modals/unit-dispatch/hooks/useUnitDispatchViewModel";

export interface CategoryDetailViewModel extends UseUnitDispatchViewModelReturn {
  detail: CategoryDetail;
  /** `Date.now()`, ticking — drives every unit card's "libre en X min". */
  now: number;
}
