"use client";

import { useCallback, useState } from "react";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { fetchBoardCategories } from "@/app/utils/tablero/board";
import { useEquipmentRealtimeRefresh } from "@/app/utils/tablero/useEquipmentRealtimeRefresh";
import type { BoardProps } from "../models/BoardProps.interface";
import type { BoardViewModel } from "../models/BoardViewModel.interface";

const BOARD_CHANNEL_NAME = "board";
const EMPTY_LENGTH = 0;

/**
 * US-TAB-001/003: the initial render comes from the server (cheap first
 * paint, US-TAB-006) and this hook only takes over from there, refetching
 * the same server-side query whenever a watched table changes — it never
 * recomputes availability itself.
 */
export const useBoardViewModel = ({
  initialCategories,
}: BoardProps): BoardViewModel => {
  const [categories, setCategories] = useState(initialCategories);

  const refetch = useCallback(() => {
    const supabase = createBrowserSupabaseClient();
    void fetchBoardCategories(supabase).then(setCategories);
  }, []);

  useEquipmentRealtimeRefresh(refetch, BOARD_CHANNEL_NAME);

  return { categories, isEmpty: categories.length === EMPTY_LENGTH };
};
