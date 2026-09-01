import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { RESERVATION_TYPE } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  fetchPendingDispatchReservations,
  type OperationsReservationSummary,
} from "./dispatchBoard";

interface ReservationItemCategoryRow {
  reservation_id: string;
}

const EMPTY_LENGTH = 0;

/**
 * US-OPE-002 (tablero entry): narrows today's pending reservations
 * (`fetchPendingDispatchReservations`) to the ones that can actually take a
 * unit tapped on `/tablero/categoria/[categoryId]` — a combo's equipment is
 * fixed by its own definition (`DispatchModalEquipmentStep` locks it), so
 * offering one here would silently ignore whichever physical units the
 * operator just selected.
 */
export const fetchPendingDispatchReservationsForCategory =
  async (
    supabase: SupabaseClient<Database>,
    categoryId: string,
    dayStartsAt: string,
    dayEndsAt: string
  ): Promise<OperationsReservationSummary[]> => {
    const pendingReservations =
      await fetchPendingDispatchReservations(
        supabase,
        dayStartsAt,
        dayEndsAt
      );
    const dispatchableReservations =
      pendingReservations.filter(
        (reservation) =>
          reservation.type !== RESERVATION_TYPE.COMBO
      );
    if (dispatchableReservations.length === EMPTY_LENGTH) {
      return [];
    }

    const { data, error } = await supabase
      .from("reservation_items")
      .select(
        "reservation_id, unit:equipment_units!inner(category_id)"
      )
      .in(
        "reservation_id",
        dispatchableReservations.map(
          (reservation) => reservation.id
        )
      )
      .eq("unit.category_id", categoryId);
    throwIfSupabaseError(
      error,
      "operaciones.dispatchByCategory.fetchPendingDispatchReservationsForCategory"
    );

    const reservationIdsForCategory = new Set(
      ((data ?? []) as ReservationItemCategoryRow[]).map(
        (row) => row.reservation_id
      )
    );
    return dispatchableReservations.filter((reservation) =>
      reservationIdsForCategory.has(reservation.id)
    );
  };
