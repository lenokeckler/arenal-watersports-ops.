import type { Nullable } from "@/app/types";
import type { UsageMetric } from "@/app/constants";
import type { ReservationEquipmentItem } from "./reservationEquipmentItems";

export interface EquipmentReadingFieldState {
  fuelPercent: string;
  itemId: string;
  showFuel: boolean;
  showUsage: boolean;
  unitCode: string;
  unitId: string;
  usageMetric: Nullable<UsageMetric>;
  usageReading: string;
}

const EMPTY_READING = "";

/**
 * Turns a reservation's motorized/fuel-consuming units into blank editable
 * rows for a fuel/hours form — shared by the dispatch sheet (US-OPE-003)
 * and the real close (US-OPE-009). Items without a unit, or whose category
 * needs neither reading, never produce a row.
 */
export const buildEquipmentReadingFields = (
  items: ReservationEquipmentItem[]
): EquipmentReadingFieldState[] =>
  items
    .filter(
      (item) =>
        item.unitId && (item.consumesFuel || item.hasMotor)
    )
    .map((item) => ({
      fuelPercent: EMPTY_READING,
      itemId: item.id,
      showFuel: item.consumesFuel,
      showUsage: item.hasMotor,
      unitCode: item.unitCode ?? "",
      unitId: item.unitId as string,
      usageMetric: item.usageMetric,
      usageReading: EMPTY_READING,
    }));

/** A blank field means "not read", not zero — this is what tells them apart. */
export const parseReadingValue = (
  raw: string
): number | null => (raw.trim() ? Number(raw) : null);
