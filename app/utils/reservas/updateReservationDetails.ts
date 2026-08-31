import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface UpdateReservationDetailsPayload {
  customerName: string;
  durationMinutes: number;
  peopleCount: number;
  startsAt: string;
}

/**
 * US-RES-018: the reservation's own fields — name, people, franja and
 * duration. `updated_by` is set on every write so the detail screen always
 * says who touched the reservation last, per the story's own criterion.
 */
export const updateReservationDetails = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  payload: UpdateReservationDetailsPayload,
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("reservations")
    .update({
      customer_name: payload.customerName,
      duration_minutes: payload.durationMinutes,
      people_count: payload.peopleCount,
      starts_at: payload.startsAt,
      updated_by: workerId,
    })
    .eq("id", reservationId);
  throwIfSupabaseError(
    error,
    "reservas.updateReservationDetails.updateReservationDetails"
  );
};
