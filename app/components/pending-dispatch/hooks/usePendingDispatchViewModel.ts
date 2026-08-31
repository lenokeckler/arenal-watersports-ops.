"use client";

import { useCallback, useState } from "react";
import { CALENDAR_VIEW } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { fetchPendingDispatchReservations } from "@/app/utils/operaciones/dispatchBoard";
import { resolveCalendarRange } from "@/app/utils/reservas/calendarRange";
import { useEquipmentRealtimeRefresh } from "@/app/utils/tablero/useEquipmentRealtimeRefresh";
import type { PendingDispatchProps } from "../models/PendingDispatchProps.interface";
import type { PendingDispatchViewModel } from "../models/PendingDispatchViewModel.interface";

const DISPATCH_CHANNEL_NAME = "despacho";
const EMPTY_LENGTH = 0;

/**
 * US-OPE-001: the initial render comes from the server, day already
 * resolved there — this only refetches the same day window whenever a
 * colleague dispatches, cancels or edits a reservation elsewhere.
 */
export const usePendingDispatchViewModel = ({
  initialReservations,
}: PendingDispatchProps): PendingDispatchViewModel => {
  const [reservations, setReservations] = useState(
    initialReservations
  );
  const [selectedReservationId, setSelectedReservationId] =
    useState<Nullable<string>>(null);

  const refetch = useCallback(() => {
    const supabase = createBrowserSupabaseClient();
    const range = resolveCalendarRange(
      CALENDAR_VIEW.DAY,
      new Date()
    );
    void fetchPendingDispatchReservations(
      supabase,
      range.startsAt.toISOString(),
      range.endsAt.toISOString()
    ).then(setReservations);
  }, []);

  useEquipmentRealtimeRefresh(
    refetch,
    DISPATCH_CHANNEL_NAME
  );

  const handleDispatched = (): void => {
    setSelectedReservationId(null);
    refetch();
  };

  return {
    handleCloseModal: () => setSelectedReservationId(null),
    handleDispatched,
    handleOpenDispatch: setSelectedReservationId,
    isEmpty: reservations.length === EMPTY_LENGTH,
    reservations,
    selectedReservationId,
  };
};
