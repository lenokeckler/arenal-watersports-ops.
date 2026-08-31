import type { Nullable } from "@/app/types";
import type { UsageMetric } from "@/app/constants";
import type { ReservationEquipmentItem } from "./reservationEquipmentItems";

export interface EquipmentReadingFieldState {
  /**
   * Con que salio la unidad. Solo lo llena el cierre: al despachar todavia
   * no hay con que comparar. Sirve para dos cosas — que el operador vea el
   * numero anterior antes de teclear el suyo, y que el campo no acepte uno
   * menor, que es lo que `reservation_items_usage_never_goes_back` rechaza
   * en la base.
   */
  departureFuel: Nullable<number>;
  departureUsage: Nullable<number>;
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
      departureFuel: item.fuelOut,
      departureUsage: item.usageOut,
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
