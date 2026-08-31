import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type { ReservationType } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { insertReservationPricing } from "./reservationPricing";

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

const insertReservationRow = async (
  supabase: SupabaseClient<Database>,
  payload: NewReservationPayload,
  workerId: string
): Promise<string> => {
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      combo_id: payload.comboId ?? null,
      created_by: workerId,
      customer_name: payload.customerName,
      duration_minutes: payload.durationMinutes,
      people_count: payload.peopleCount,
      starts_at: payload.startsAt,
      type: payload.type,
      updated_by: workerId,
    })
    .select("id")
    .single();
  throwIfSupabaseError(
    error,
    "reservas.createReservation.reservation"
  );

  if (!data) {
    throw new Error(
      "reservas.createReservation: insert returned no row"
    );
  }
  return data.id;
};

const insertReservationItems = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  items: NewReservationEquipmentItem[],
  workerId: string
): Promise<void> => {
  if (items.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("reservation_items")
    .insert(
      items.map((item) => ({
        category_id: item.categoryId,
        created_by: workerId,
        extra_id: item.extraId ?? null,
        quantity: item.quantity,
        reservation_id: reservationId,
        unit_id: item.unitId,
        updated_by: workerId,
      }))
    );
  throwIfSupabaseError(
    error,
    "reservas.createReservation.items"
  );
};

const insertReservationGuides = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  guideWorkerIds: string[],
  workerId: string
): Promise<void> => {
  if (guideWorkerIds.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("reservation_guides")
    .insert(
      guideWorkerIds.map((guideWorkerId) => ({
        assigned_by: workerId,
        reservation_id: reservationId,
        worker_id: guideWorkerId,
      }))
    );
  throwIfSupabaseError(
    error,
    "reservas.createReservation.guides"
  );
};

/**
 * US-RES-004/US-RES-007/US-RES-009/US-RES-010/US-RES-012: up to four
 * inserts, not one transaction — this project has no server-side function
 * for it and none was in scope to add. Moving the price to its own table
 * made the gap one write wider, not different in kind: the reservation
 * always lands first and each later failure throws with its own context,
 * so the worker gets a reservation row to open and can complete the rest
 * by hand instead of losing the record of the commitment. Actually
 * charging the customer belongs to `reservation_charges`, out of this
 * dispatch's scope (EP-RES-07).
 */
export const createReservation = async (
  supabase: SupabaseClient<Database>,
  payload: NewReservationPayload,
  workerId: string
): Promise<{ id: string }> => {
  const reservationId = await insertReservationRow(
    supabase,
    payload,
    workerId
  );

  // Written straight after the reservation row and before its equipment,
  // because this is the write whose failure hides best: a reservation with
  // no `reservation_pricing` row looks exactly like the ordinary renta
  // nobody priced yet, while one with no items is obviously broken on the
  // detail screen.
  await insertReservationPricing(
    supabase,
    reservationId,
    {
      agreedAmountCrc: payload.agreedAmountCrc,
      agreedAmountUsd: payload.agreedAmountUsd,
      listAmountCrc: payload.listAmountCrc,
      listAmountUsd: payload.listAmountUsd,
    },
    workerId
  );
  await insertReservationItems(
    supabase,
    reservationId,
    payload.items,
    workerId
  );
  await insertReservationGuides(
    supabase,
    reservationId,
    payload.guideWorkerIds ?? [],
    workerId
  );

  return { id: reservationId };
};
