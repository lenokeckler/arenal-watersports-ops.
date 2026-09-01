import type { Nullable } from "@/app/types";
import {
  FUEL_LEVEL_NUMBERS,
  type UsageMetric,
} from "@/app/constants";
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
  fuelLevel: string;
  /** Cuantas lineas tiene el medidor de esta unidad — el tope de `fuelLevel`. */
  fuelMax: number;
  itemId: string;
  showFuel: boolean;
  showUsage: boolean;
  unitCode: string;
  unitId: string;
  usageMetric: Nullable<UsageMetric>;
  usageReading: string;
}

export interface DispatchSheetRow {
  categoryName: string;
  itemId: string;
  /** Solo la llevan las lineas por cantidad — kayaks, paddleboards, etc. */
  quantity: Nullable<number>;
  /** Presente solo si la categoria consume gasolina o lleva motor. */
  reading: Nullable<EquipmentReadingFieldState>;
  /** Solo la llevan las lineas por unidad. */
  unitCode: Nullable<string>;
}

const EMPTY_READING = "";

const buildReadingField = (
  item: ReservationEquipmentItem
): EquipmentReadingFieldState => ({
  departureFuel: item.fuelOut,
  departureUsage: item.usageOut,
  fuelLevel: EMPTY_READING,
  fuelMax:
    item.unitFuelMax ?? FUEL_LEVEL_NUMBERS.DEFAULT_MAX,
  itemId: item.id,
  showFuel: item.consumesFuel,
  showUsage: item.hasMotor,
  unitCode: item.unitCode ?? EMPTY_READING,
  unitId: item.unitId as string,
  usageMetric: item.usageMetric,
  usageReading: EMPTY_READING,
});

/**
 * US-OPE-002/US-OPE-003: one row per item the reservation commits, so the
 * dispatch sheet is never empty for equipment like kayaks or paddleboards
 * that take neither gasoline nor an hour reading — they still show their
 * category and how many go out. A unit that also consumes fuel or has a
 * motor additionally carries a `reading` (US-OPE-003 applies "solo a las
 * categorías que llevan motor"); what is *shown* and what takes a *reading*
 * are two different questions, and this is where they split.
 */
export const buildDispatchSheetRows = (
  items: ReservationEquipmentItem[]
): DispatchSheetRow[] =>
  items.map((item) => ({
    categoryName: item.categoryName ?? EMPTY_READING,
    itemId: item.id,
    quantity: item.quantity,
    reading:
      item.unitId && (item.consumesFuel || item.hasMotor)
        ? buildReadingField(item)
        : null,
    unitCode: item.unitCode,
  }));

/** A blank field means "not read", not zero — this is what tells them apart. */
export const parseReadingValue = (
  raw: string
): number | null => (raw.trim() ? Number(raw) : null);
