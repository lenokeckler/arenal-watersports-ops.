"use client";

import { useEffect, useState } from "react";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  fetchDispatchEquipmentCatalog,
  type DispatchEquipmentCatalog,
} from "@/app/utils/operaciones/dispatchEquipmentCatalog";

export interface UseDispatchModalCatalogViewModelReturn {
  catalog: Nullable<DispatchEquipmentCatalog>;
  isLoading: boolean;
}

/**
 * US-OPE-002: loads the reservation's committed equipment plus the
 * reservable catalog once, on mount — `DispatchModal` gates on `isLoading`
 * before mounting the wizard body, matching `ReservationEditModal`'s own
 * catalog-loading gate.
 */
export const useDispatchModalCatalogViewModel = (
  reservationId: string
): UseDispatchModalCatalogViewModelReturn => {
  const [catalog, setCatalog] =
    useState<Nullable<DispatchEquipmentCatalog>>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    void fetchDispatchEquipmentCatalog(
      supabase,
      reservationId
    ).then((result) => {
      setCatalog(result);
      setIsLoading(false);
    });
  }, [reservationId]);

  return { catalog, isLoading };
};
