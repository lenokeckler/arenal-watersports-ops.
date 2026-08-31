import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import type { ReservationType } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface NewReservationEquipmentItem {
  categoryId: string | null;
  quantity: number | null;
  unitId: string | null;
}

export interface NewReservationPayload {
  customerName: string;
  durationMinutes: number;
  items: NewReservationEquipmentItem[];
  peopleCount: number;
  startsAt: string;
  type: ReservationType;
}

/**
 * US-RES-004/US-RES-007: two inserts, not one transaction — this project
 * has no server-side function for it and none was in scope to add. The
 * reservation always lands first; on the rare failure of the second
 * insert the worker still has a reservation row to open and the items
 * insert can be retried by hand, which is safer than leaving no record
 * of the commitment at all.
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

  return { id: reservation.id };
};
