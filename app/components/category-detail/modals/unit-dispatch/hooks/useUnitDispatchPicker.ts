"use client";

import { useState } from "react";
import { CALENDAR_VIEW } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { resolveCalendarRange } from "@/app/utils/reservas/calendarRange";
import { fetchPendingDispatchReservationsForCategory } from "@/app/utils/operaciones/dispatchByCategory";
import type { OperationsReservationSummary } from "@/app/utils/operaciones/dispatchBoard";

export interface UseUnitDispatchPickerReturn {
  candidateReservations: OperationsReservationSummary[];
  closePicker: () => void;
  isLoadingCandidates: boolean;
  isPickerOpen: boolean;
  openPicker: () => void;
}

/**
 * US-OPE-002 (tablero entry): loads today's pending reservations that can
 * take a unit from this category only once the operator asks to dispatch —
 * same lazy-load gate `useDispatchModalCatalogViewModel` uses for its own
 * catalog, so the board never fetches this for a category nobody is
 * dispatching from.
 */
export const useUnitDispatchPicker = (
  categoryId: string
): UseUnitDispatchPickerReturn => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLoadingCandidates, setIsLoadingCandidates] =
    useState(false);
  const [candidateReservations, setCandidateReservations] =
    useState<OperationsReservationSummary[]>([]);

  const openPicker = (): void => {
    setIsPickerOpen(true);
    setIsLoadingCandidates(true);
    const supabase = createBrowserSupabaseClient();
    const range = resolveCalendarRange(
      CALENDAR_VIEW.DAY,
      new Date()
    );
    void fetchPendingDispatchReservationsForCategory(
      supabase,
      categoryId,
      range.startsAt.toISOString(),
      range.endsAt.toISOString()
    ).then((reservations) => {
      setCandidateReservations(reservations);
      setIsLoadingCandidates(false);
    });
  };

  const closePicker = (): void => {
    setIsPickerOpen(false);
    setCandidateReservations([]);
  };

  return {
    candidateReservations,
    closePicker,
    isLoadingCandidates,
    isPickerOpen,
    openPicker,
  };
};
