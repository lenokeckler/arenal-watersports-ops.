import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import { RESERVATION_TYPE } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  fetchCandidateUnits,
  fetchReservableCategories,
  type CandidateUnit,
  type ReservableCategory,
} from "@/app/utils/reservas/newReservationData";
import {
  fetchReservationEquipmentItems,
  type ReservationEquipmentItem,
} from "@/app/utils/reservas/reservationEquipmentItems";
import { filterCategoriesForReservationType } from "@/app/utils/reservas/groupCategories";

export interface DispatchEquipmentCatalog {
  candidateUnits: CandidateUnit[];
  categories: ReservableCategory[];
  endsAt: string;
  isCombo: boolean;
  originalItems: ReservationEquipmentItem[];
  startsAt: string;
}

/**
 * US-OPE-002: everything the dispatch sheet's "confirm equipment" step
 * needs before it can seed its selection on the first render — same
 * ordering constraint as `useReservationEditModalCatalog`. `isCombo` mirrors
 * US-RES-018's own lock: a combo's equipment is fixed by its definition, not
 * something the picker changes.
 */
export const fetchDispatchEquipmentCatalog = async (
  supabase: SupabaseClient<Database>,
  reservationId: string
): Promise<Nullable<DispatchEquipmentCatalog>> => {
  const [reservationResult, originalItems] =
    await Promise.all([
      supabase
        .from("reservations")
        .select("ends_at, starts_at, type")
        .eq("id", reservationId)
        .maybeSingle(),
      fetchReservationEquipmentItems(
        supabase,
        reservationId
      ),
    ]);
  throwIfSupabaseError(
    reservationResult.error,
    "operaciones.dispatchEquipmentCatalog.fetchDispatchEquipmentCatalog"
  );

  const reservation = reservationResult.data;
  if (!reservation) {
    return null;
  }

  const allCategories =
    await fetchReservableCategories(supabase);
  // US-RES-008: a renta never offers guide-only equipment as a substitute
  // either — the same rule `useReservationFormViewModel` applies when the
  // reservation is first created.
  const categories = filterCategoriesForReservationType(
    allCategories,
    reservation.type
  );
  const candidateUnits = await fetchCandidateUnits(
    supabase,
    categories.map((category) => category.id)
  );

  return {
    candidateUnits,
    categories,
    endsAt: reservation.ends_at ?? reservation.starts_at,
    isCombo: reservation.type === RESERVATION_TYPE.COMBO,
    originalItems,
    startsAt: reservation.starts_at,
  };
};
