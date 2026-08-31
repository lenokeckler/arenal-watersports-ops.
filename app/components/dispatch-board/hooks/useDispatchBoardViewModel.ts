"use client";

import { useCallback, useEffect, useState } from "react";
import { OPERATIONS_NUMBERS } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { fetchDispatchedReservations } from "@/app/utils/operaciones/dispatchBoard";
import { useEquipmentRealtimeRefresh } from "@/app/utils/tablero/useEquipmentRealtimeRefresh";
import type { DispatchBoardProps } from "../models/DispatchBoardProps.interface";
import type { DispatchBoardViewModel } from "../models/DispatchBoardViewModel.interface";

const BOARD_CHANNEL_NAME = "operaciones-despacho";
const EMPTY_LENGTH = 0;

/**
 * US-OPE-004/US-OPE-005/US-OPE-006/US-OPE-008: everything currently out on
 * the water. `now` ticks on its own so the countdown moves without a
 * refetch; `reservations` only refetches when a watched table actually
 * changes (a dispatch, a close, an adjustment).
 */
export const useDispatchBoardViewModel = ({
  initialReservations,
}: DispatchBoardProps): DispatchBoardViewModel => {
  const [reservations, setReservations] = useState(
    initialReservations
  );
  const [selectedReservationId, setSelectedReservationId] =
    useState<Nullable<string>>(null);
  const [now, setNow] = useState(() => Date.now());

  const refetch = useCallback(() => {
    const supabase = createBrowserSupabaseClient();
    void fetchDispatchedReservations(supabase).then(
      setReservations
    );
  }, []);

  useEquipmentRealtimeRefresh(refetch, BOARD_CHANNEL_NAME);

  useEffect(() => {
    const tick = setInterval(
      () => setNow(Date.now()),
      OPERATIONS_NUMBERS.CLOCK_TICK_MS
    );
    return () => clearInterval(tick);
  }, []);

  const handleDurationAdjusted = (): void => {
    setSelectedReservationId(null);
    refetch();
  };

  const selectedReservation =
    reservations.find(
      (reservation) =>
        reservation.id === selectedReservationId
    ) ?? null;

  return {
    handleCloseModal: () => setSelectedReservationId(null),
    handleDurationAdjusted,
    handleOpenAdjust: setSelectedReservationId,
    isEmpty: reservations.length === EMPTY_LENGTH,
    now,
    reservations,
    selectedReservation,
  };
};
