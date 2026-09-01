"use client";

import { useCallback, useEffect, useState } from "react";
import { OPERATIONS_NUMBERS } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { fetchCategoryDetail } from "@/app/utils/tablero/categoryDetail";
import { useEquipmentRealtimeRefresh } from "@/app/utils/tablero/useEquipmentRealtimeRefresh";
import type { CategoryDetailProps } from "../models/CategoryDetailProps.interface";
import type { CategoryDetailViewModel } from "../models/CategoryDetailViewModel.interface";

/**
 * US-TAB-002/003: same pattern as `useBoardViewModel` — the server sends
 * the first render, this only re-reads `fetchCategoryDetail` (which is
 * itself only `unit_current_state` / `equipment_stock`, never a
 * client-side recomputation) whenever a watched table changes. `now` ticks
 * on its own, the same clock `useDispatchBoardViewModel` uses, so a unit
 * card's "libre en X min" moves without a refetch.
 */
export const useCategoryDetailViewModel = ({
  categoryId,
  initialDetail,
}: CategoryDetailProps): CategoryDetailViewModel => {
  const [detail, setDetail] = useState(initialDetail);
  const [now, setNow] = useState(() => Date.now());

  const refetch = useCallback(() => {
    const supabase = createBrowserSupabaseClient();
    void fetchCategoryDetail(supabase, categoryId).then(
      (updated) => {
        if (updated) {
          setDetail(updated);
        }
      }
    );
  }, [categoryId]);

  useEquipmentRealtimeRefresh(
    refetch,
    `category-${categoryId}`
  );

  useEffect(() => {
    const tick = setInterval(
      () => setNow(Date.now()),
      OPERATIONS_NUMBERS.CLOCK_TICK_MS
    );
    return () => clearInterval(tick);
  }, []);

  return { detail, now };
};
