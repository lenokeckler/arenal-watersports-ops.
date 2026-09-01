import type { CategoryDetailUnit } from "@/app/utils/tablero/categoryDetail";

export interface UnitCardProps {
  /** `Date.now()`, ticking — drives the "libre en X min" countdown. */
  now: number;
  unit: CategoryDetailUnit;
}
