import type { Nullable } from "@/app/types";
import type { UnitStatus } from "@/app/constants";
import type {
  CountSheetCategoryState,
  CountSheetState,
} from "@/app/utils/operaciones/countSheetState";

export type CountQuantityField = Extract<
  keyof CountSheetCategoryState,
  | "quantityAvailable"
  | "quantityDamaged"
  | "quantityInRepair"
>;

export interface InventoryCountViewModel {
  confirmedCount: number;
  error: Nullable<string>;
  handleNotesChange: (notes: string) => void;
  handleQuantityChange: (
    categoryId: string,
    field: CountQuantityField,
    value: string
  ) => void;
  handleSubmit: () => void;
  handleToggleConfirmed: (categoryId: string) => void;
  handleUnitStatusChange: (
    categoryId: string,
    unitId: string,
    status: UnitStatus
  ) => void;
  isBusy: boolean;
  notes: string;
  state: CountSheetState;
}
