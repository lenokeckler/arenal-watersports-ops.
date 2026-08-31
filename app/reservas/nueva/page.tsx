import type { Metadata } from "next";
import type { JSX } from "react";
import { TRACKING_MODE, WORK_AREA } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";
import {
  fetchCandidateUnitExtras,
  fetchCandidateUnits,
  fetchGuides,
  fetchReservableCategories,
  fetchReservableCombos,
  fetchTariffsForCategories,
} from "@/app/utils/reservas/newReservationData";
import ReservationForm from "@/app/components/reservation-form/ReservationForm";
import ReservationFormPageShell from "@/app/components/reservation-form/ReservationFormPageShell";

export const metadata: Metadata = {
  title: "Nueva reserva — Arenal Water Sports",
};

/**
 * `/reservas/nueva` (US-RES-004 through US-RES-012). Only reservas and
 * administración reach this screen — `reservations_insert` allows nothing
 * else, matching `requireWorkerWithAreas`.
 */
const NewReservationPage =
  async (): Promise<JSX.Element> => {
    const supabase = await createServerSupabaseClient();
    const { workerId } = await requireWorkerWithAreas(
      supabase,
      [WORK_AREA.RESERVATIONS]
    );

    const categories =
      await fetchReservableCategories(supabase);
    const byUnitCategoryIds = categories
      .filter(
        (category) =>
          category.trackingMode === TRACKING_MODE.BY_UNIT
      )
      .map((category) => category.id);
    const categoryIds = categories.map(
      (category) => category.id
    );
    const candidateUnits = await fetchCandidateUnits(
      supabase,
      byUnitCategoryIds
    );
    const candidateUnitIds = candidateUnits.map(
      (unit) => unit.id
    );

    const [combos, guides, tariffs, extrasByUnit] =
      await Promise.all([
        fetchReservableCombos(supabase),
        fetchGuides(supabase),
        fetchTariffsForCategories(supabase, categoryIds),
        fetchCandidateUnitExtras(
          supabase,
          candidateUnitIds
        ),
      ]);

    return (
      <ReservationFormPageShell>
        <ReservationForm
          candidateUnits={candidateUnits}
          categories={categories}
          combos={combos}
          extrasByUnit={extrasByUnit}
          guides={guides}
          tariffs={tariffs}
          workerId={workerId}
        />
      </ReservationFormPageShell>
    );
  };

export default NewReservationPage;
