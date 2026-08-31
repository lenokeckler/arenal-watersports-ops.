import type { Nullable } from "@/app/types";
import {
  OPERATIONS_NUMBERS,
  type DamageCause,
  type UsageMetric,
} from "@/app/constants";
import type { ReservationCloseEquipmentItem } from "./reservationCloseData";

/** One returning unit's fuel/hours reading plus its optional damage report. */
export interface ReservationCloseEquipmentRow {
  canBeDamaged: boolean;
  damageCause: DamageCause | "";
  damageDescription: string;
  damageImpactDelta: string;
  fuelPercent: string;
  impactCount: number;
  isReportingDamage: boolean;
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
 * US-OPE-009: which committed items get a row on the close screen — any
 * unit that either asks for a fuel/hours reading or can be damaged. A
 * quantity-tracked item (no `unitId`, e.g. kayaks) never produces one:
 * `damage_reports.unit_id` is not nullable, and the fuel/usage reading only
 * ever applies to a single machine, not a shared count.
 */
export const buildReservationCloseRows = (
  items: ReservationCloseEquipmentItem[]
): ReservationCloseEquipmentRow[] =>
  items
    .filter(
      (item) =>
        item.unitId &&
        (item.consumesFuel ||
          item.hasMotor ||
          item.canBeDamaged)
    )
    .map((item) => ({
      canBeDamaged: item.canBeDamaged,
      damageCause: "",
      damageDescription: EMPTY_READING,
      damageImpactDelta: String(
        OPERATIONS_NUMBERS.IMPACT_DELTA_MIN
      ),
      fuelPercent: EMPTY_READING,
      impactCount: item.impactCount,
      isReportingDamage: false,
      itemId: item.id,
      showFuel: item.consumesFuel,
      showUsage: item.hasMotor,
      unitCode: item.unitCode ?? EMPTY_READING,
      unitId: item.unitId as string,
      usageMetric: item.usageMetric,
      usageReading: EMPTY_READING,
    }));
