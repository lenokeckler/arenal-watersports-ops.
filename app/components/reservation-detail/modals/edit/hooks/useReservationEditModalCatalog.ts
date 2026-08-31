"use client";

import { useEffect, useState } from "react";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
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

export interface UseReservationEditModalCatalogReturn {
  candidateUnits: CandidateUnit[];
  categories: ReservableCategory[];
  isLoading: boolean;
  originalItems: ReservationEquipmentItem[];
}

/**
 * US-RES-018: the reservation's current equipment plus the reservable
 * catalog, loaded once so the equipment selector below can initialize
 * correctly on its own first render — see `ReservationEditModal` for why
 * that ordering matters.
 */
export const useReservationEditModalCatalog = (
  reservationId: string
): UseReservationEditModalCatalogReturn => {
  const [candidateUnits, setCandidateUnits] = useState<
    CandidateUnit[]
  >([]);
  const [categories, setCategories] = useState<
    ReservableCategory[]
  >([]);
  const [originalItems, setOriginalItems] = useState<
    ReservationEquipmentItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    void Promise.all([
      fetchReservationEquipmentItems(
        supabase,
        reservationId
      ),
      fetchReservableCategories(supabase),
    ]).then(async ([items, reservableCategories]) => {
      const units = await fetchCandidateUnits(
        supabase,
        reservableCategories.map((category) => category.id)
      );
      setOriginalItems(items);
      setCategories(reservableCategories);
      setCandidateUnits(units);
      setIsLoading(false);
    });
  }, [reservationId]);

  return {
    candidateUnits,
    categories,
    isLoading,
    originalItems,
  };
};
