import {
  TRACKING_MODE,
  type UnitStatus,
} from "@/app/constants";
import type { CountSheetCategory } from "./inventoryCountSheet";
import type { InventoryCountLine } from "./createInventoryCount";

export interface CountSheetCategoryState {
  isConfirmed: boolean;
  quantityAvailable: string;
  quantityDamaged: string;
  quantityInRepair: string;
  unitStatuses: Record<string, UnitStatus>;
}

export type CountSheetState = Record<
  string,
  CountSheetCategoryState
>;

/**
 * US-OPE-023: the sheet opens on what the system currently believes, so
 * the count is a confirmation rather than a transcription — "en las
 * identificadas una por una se confirma cada unidad y su estado".
 */
export const buildInitialCountState = (
  categories: CountSheetCategory[]
): CountSheetState =>
  Object.fromEntries(
    categories.map((category) => [
      category.categoryId,
      {
        isConfirmed: false,
        quantityAvailable: String(
          category.quantityAvailable
        ),
        quantityDamaged: String(category.quantityDamaged),
        quantityInRepair: String(category.quantityInRepair),
        unitStatuses: Object.fromEntries(
          category.units.map((unit) => [
            unit.unitId,
            unit.recordedStatus,
          ])
        ),
      },
    ])
  );

const FALLBACK_QUANTITY = 0;

const toQuantity = (raw: string): number =>
  Number(raw) || FALLBACK_QUANTITY;

const toCategoryLines = (
  category: CountSheetCategory,
  state: CountSheetCategoryState
): InventoryCountLine[] => {
  if (category.trackingMode === TRACKING_MODE.BY_UNIT) {
    return category.units.map((unit) => ({
      categoryId: category.categoryId,
      confirmedStatus:
        state.unitStatuses[unit.unitId] ??
        unit.recordedStatus,
      quantityAvailable: null,
      quantityDamaged: null,
      quantityInRepair: null,
      // Una categoria por unidad se compara ficha por ficha, no por
      // cantidad: aqui no hay resta que guardar.
      systemQuantityAvailable: null,
      systemQuantityDamaged: null,
      systemQuantityInRepair: null,
      unitId: unit.unitId,
    }));
  }

  return [
    {
      categoryId: category.categoryId,
      confirmedStatus: null,
      quantityAvailable: toQuantity(
        state.quantityAvailable
      ),
      quantityDamaged: toQuantity(state.quantityDamaged),
      quantityInRepair: toQuantity(state.quantityInRepair),
      // Lo que el sistema decia en este momento, congelado con la linea.
      // Es la unica forma de que un conteo viejo siga diciendo si aquel
      // dia faltaba algo: el inventario de hoy ya cambio (US-OPE-024).
      systemQuantityAvailable: category.quantityAvailable,
      systemQuantityDamaged: category.quantityDamaged,
      systemQuantityInRepair: category.quantityInRepair,
      unitId: null,
    },
  ];
};

/**
 * Only confirmed categories become lines. A count that skipped half the
 * warehouse is still a truthful count of the half that was walked —
 * writing untouched categories as if they had been checked would be the
 * lie.
 */
export const buildCountLines = (
  categories: CountSheetCategory[],
  state: CountSheetState
): InventoryCountLine[] =>
  categories
    .filter(
      (category) => state[category.categoryId]?.isConfirmed
    )
    .flatMap((category) =>
      toCategoryLines(category, state[category.categoryId])
    );

export const countConfirmedCategories = (
  state: CountSheetState
): number =>
  Object.values(state).filter(
    (category) => category.isConfirmed
  ).length;
