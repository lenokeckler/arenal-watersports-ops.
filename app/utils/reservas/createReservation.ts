import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type { ReservationType } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface NewReservationEquipmentItem {
  categoryId: Nullable<string>;
  extraId?: Nullable<string>;
  quantity: Nullable<number>;
  unitId: Nullable<string>;
}

export interface NewReservationPayload {
  /** US-RES-009/US-RES-010: only ever set for `type === 'combo'`. */
  agreedAmountCrc?: Nullable<number>;
  agreedAmountUsd?: Nullable<number>;
  comboId?: Nullable<string>;
  customerName: string;
  durationMinutes: number;
  /** US-RES-012: only relevant for `type === 'tour'`. */
  guideWorkerIds?: string[];
  items: NewReservationEquipmentItem[];
  listAmountCrc?: Nullable<number>;
  listAmountUsd?: Nullable<number>;
  peopleCount: number;
  startsAt: string;
  type: ReservationType;
}

/**
 * US-RES-004/US-RES-007/US-RES-009/US-RES-010/US-RES-012: three inserts,
 * not one transaction — this project has no server-side function for it and
 * none was in scope to add. The reservation always lands first; on a rare
 * failure of the items or guides insert the worker still has a reservation
 * row to open and can retry the rest by hand, which is safer than leaving
 * no record of the commitment at all. `listAmount`/`agreedAmount` are only
 * ever populated here for a combo (US-RES-009's package price or
 * US-RES-010's suggested sum) — actually charging the customer belongs to
 * `reservation_charges`, out of this dispatch's scope (EP-RES-07).
 */
export const createReservation = async (
  supabase: SupabaseClient<Database>,
  payload: NewReservationPayload,
  workerId: string
): Promise<{ id: string }> => {
  const { data: reservation, error: reservationError } =
    await supabase
      .from("reservations")
      .insert({
        agreed_amount_crc: payload.agreedAmountCrc ?? null,
        agreed_amount_usd: payload.agreedAmountUsd ?? null,
        combo_id: payload.comboId ?? null,
        created_by: workerId,
        customer_name: payload.customerName,
        duration_minutes: payload.durationMinutes,
        list_amount_crc: payload.listAmountCrc ?? null,
        list_amount_usd: payload.listAmountUsd ?? null,
        people_count: payload.peopleCount,
        starts_at: payload.startsAt,
        type: payload.type,
        updated_by: workerId,
      })
      .select("id")
      .single();
  throwIfSupabaseError(
    reservationError,
    "reservas.createReservation.reservation"
  );

  if (!reservation) {
    throw new Error(
      "reservas.createReservation: insert returned no row"
    );
  }

  if (payload.items.length > 0) {
    const { error: itemsError } = await supabase
      .from("reservation_items")
      .insert(
        payload.items.map((item) => ({
          category_id: item.categoryId,
          created_by: workerId,
          extra_id: item.extraId ?? null,
          quantity: item.quantity,
          reservation_id: reservation.id,
          unit_id: item.unitId,
          updated_by: workerId,
        }))
      );
    throwIfSupabaseError(
      itemsError,
      "reservas.createReservation.items"
    );
  }

  const guideWorkerIds = payload.guideWorkerIds ?? [];
  if (guideWorkerIds.length > 0) {
    const { error: guidesError } = await supabase
      .from("reservation_guides")
      .insert(
        guideWorkerIds.map((guideWorkerId) => ({
          assigned_by: workerId,
          reservation_id: reservation.id,
          worker_id: guideWorkerId,
        }))
      );
    throwIfSupabaseError(
      guidesError,
      "reservas.createReservation.guides"
    );
  }

  return { id: reservation.id };
};
