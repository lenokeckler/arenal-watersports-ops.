import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type { ReservationStatus } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  fetchReservationEquipmentItems,
  type ReservationEquipmentItem,
} from "@/app/utils/reservas/reservationEquipmentItems";

/** Adds what the damage-report form needs on top of the shared equipment shape. */
export interface ReservationCloseEquipmentItem extends ReservationEquipmentItem {
  canBeDamaged: boolean;
  impactCount: number;
}

export interface ReservationCloseData {
  code: string;
  customerName: string;
  dispatchedAt: Nullable<string>;
  durationMinutes: number;
  id: string;
  items: ReservationCloseEquipmentItem[];
  startsAt: string;
  status: ReservationStatus;
}

interface UnitDamageContext {
  canBeDamaged: boolean;
  impactCount: number;
}

const fetchUnitDamageContext = async (
  supabase: SupabaseClient<Database>,
  unitIds: string[]
): Promise<Map<string, UnitDamageContext>> => {
  const context = new Map<string, UnitDamageContext>();
  if (unitIds.length === 0) {
    return context;
  }

  const { data, error } = await supabase
    .from("equipment_units")
    .select(
      "id, impact_count, category:equipment_categories(can_be_damaged)"
    )
    .in("id", unitIds);
  throwIfSupabaseError(
    error,
    "operaciones.reservationCloseData.fetchUnitDamageContext"
  );

  for (const unit of data ?? []) {
    context.set(unit.id, {
      canBeDamaged: unit.category?.can_be_damaged ?? false,
      impactCount: unit.impact_count,
    });
  }
  return context;
};

/**
 * US-OPE-009: everything the closing screen needs in one call — the
 * equipment committed (via the same `fetchReservationEquipmentItems` the
 * edit/split/postpone modals already use) plus each unit's current impact
 * count, so the damage form starts from the real number instead of zero.
 * Explicit columns only, `list_amount_*`/`agreed_amount_*` excluded on
 * purpose — operaciones does not see money.
 */
export const fetchReservationCloseData = async (
  supabase: SupabaseClient<Database>,
  reservationId: string
): Promise<Nullable<ReservationCloseData>> => {
  const [reservationResult, items] = await Promise.all([
    supabase
      .from("reservations")
      .select(
        "id, code, customer_name, dispatched_at, duration_minutes, starts_at, status"
      )
      .eq("id", reservationId)
      .maybeSingle(),
    fetchReservationEquipmentItems(supabase, reservationId),
  ]);
  throwIfSupabaseError(
    reservationResult.error,
    "operaciones.reservationCloseData.fetchReservationCloseData"
  );

  const reservation = reservationResult.data;
  if (!reservation) {
    return null;
  }

  const unitIds = items
    .map((item) => item.unitId)
    .filter((unitId): unitId is string => Boolean(unitId));
  const damageContext = await fetchUnitDamageContext(
    supabase,
    unitIds
  );

  return {
    code: reservation.code,
    customerName: reservation.customer_name,
    dispatchedAt: reservation.dispatched_at,
    durationMinutes: reservation.duration_minutes,
    id: reservation.id,
    items: items.map((item) => ({
      ...item,
      canBeDamaged: item.unitId
        ? (damageContext.get(item.unitId)?.canBeDamaged ??
          false)
        : false,
      impactCount: item.unitId
        ? (damageContext.get(item.unitId)?.impactCount ?? 0)
        : 0,
    })),
    startsAt: reservation.starts_at,
    status: reservation.status,
  };
};
