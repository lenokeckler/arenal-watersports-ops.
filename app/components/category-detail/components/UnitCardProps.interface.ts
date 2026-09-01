import type { CategoryDetailUnit } from "@/app/utils/tablero/categoryDetail";

export interface UnitCardProps {
  /** US-OPE-002 (tablero entry): only available units become a tap target. */
  isSelectable: boolean;
  isSelected: boolean;
  /** `Date.now()`, ticking — drives the "libre en X min" countdown. */
  now: number;
  onToggleSelect: (unitId: string) => void;
  unit: CategoryDetailUnit;
}
