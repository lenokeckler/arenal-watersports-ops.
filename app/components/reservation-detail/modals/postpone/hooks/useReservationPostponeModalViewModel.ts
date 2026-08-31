"use client";

import { useEffect, useState } from "react";
import {
  RESERVATION_DETAIL_SCREEN,
  RESERVATION_STATUS,
  type ReservationStatus,
  type UsageMetric,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  computeStartsAtIso,
  toDateOnlyParam,
  toTimeOnlyParam,
} from "@/app/utils/reservas/calendarRange";
import { fetchReservationEquipmentItems } from "@/app/utils/reservas/reservationEquipmentItems";
import {
  postponeDispatchedReservation,
  postponeScheduledReservation,
  type UnitClosingReading,
} from "@/app/utils/reservas/postponeReservation";

export interface ClosingFieldState {
  fuelPercent: string;
  itemId: string;
  showFuel: boolean;
  showUsage: boolean;
  unitCode: string;
  unitId: string;
  usageMetric: Nullable<UsageMetric>;
  usageReading: string;
}

interface UseReservationPostponeModalViewModelParams {
  onPostponed: () => void;
  reservationId: string;
  startsAt: string;
  status: ReservationStatus;
  workerId: string;
}

export interface UseReservationPostponeModalViewModelReturn {
  closings: ClosingFieldState[];
  date: string;
  error: Nullable<string>;
  handleDateChange: (value: string) => void;
  handleFuelChange: (
    itemId: string,
    value: string
  ) => void;
  handleSubmit: () => void;
  handleTimeChange: (value: string) => void;
  handleUsageChange: (
    itemId: string,
    value: string
  ) => void;
  isBusy: boolean;
  isDispatched: boolean;
  isLoadingClosings: boolean;
  time: string;
}

const toClosingReadings = (
  closings: ClosingFieldState[]
): UnitClosingReading[] =>
  closings.map((closing) => ({
    fuelPercent: closing.fuelPercent.trim()
      ? Number(closing.fuelPercent)
      : null,
    itemId: closing.itemId,
    unitId: closing.unitId,
    usageReading: closing.usageReading.trim()
      ? Number(closing.usageReading)
      : null,
  }));

/**
 * US-RES-020: a `scheduled` reservation just moves; a `dispatched` one
 * (weather only) also closes each motorized unit right now, so the modal
 * loads the reservation's own equipment on mount and only asks for a
 * reading where there is one to ask for (`consumesFuel`/`hasMotor`).
 */
export const useReservationPostponeModalViewModel = ({
  onPostponed,
  reservationId,
  startsAt,
  status,
  workerId,
}: UseReservationPostponeModalViewModelParams): UseReservationPostponeModalViewModelReturn => {
  const initialDate = new Date(startsAt);
  const [date, setDate] = useState(
    toDateOnlyParam(initialDate)
  );
  const [time, setTime] = useState(
    toTimeOnlyParam(initialDate)
  );
  const [closings, setClosings] = useState<
    ClosingFieldState[]
  >([]);
  const [isLoadingClosings, setIsLoadingClosings] =
    useState(status === RESERVATION_STATUS.DISPATCHED);
  const [error, setError] = useState<Nullable<string>>(
    null
  );
  const [isBusy, setIsBusy] = useState(false);

  const isDispatched =
    status === RESERVATION_STATUS.DISPATCHED;

  useEffect(() => {
    if (!isDispatched) {
      return;
    }
    const supabase = createBrowserSupabaseClient();
    void fetchReservationEquipmentItems(
      supabase,
      reservationId
    ).then((items) => {
      setClosings(
        items
          .filter(
            (item) =>
              item.unitId &&
              (item.consumesFuel || item.hasMotor)
          )
          .map((item) => ({
            fuelPercent: "",
            itemId: item.id,
            showFuel: item.consumesFuel,
            showUsage: item.hasMotor,
            unitCode: item.unitCode ?? "",
            unitId: item.unitId as string,
            usageMetric: item.usageMetric,
            usageReading: "",
          }))
      );
      setIsLoadingClosings(false);
    });
    // Runs once per modal mount — a fresh reservationId always remounts it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFuelChange = (
    itemId: string,
    value: string
  ): void => {
    setClosings((current) =>
      current.map((closing) =>
        closing.itemId === itemId
          ? { ...closing, fuelPercent: value }
          : closing
      )
    );
  };

  const handleUsageChange = (
    itemId: string,
    value: string
  ): void => {
    setClosings((current) =>
      current.map((closing) =>
        closing.itemId === itemId
          ? { ...closing, usageReading: value }
          : closing
      )
    );
  };

  const handleSubmit = (): void => {
    const newStartsAt = computeStartsAtIso(date, time);
    if (!newStartsAt) {
      setError(
        RESERVATION_DETAIL_SCREEN.POSTPONE
          .STARTS_AT_REQUIRED
      );
      return;
    }

    setIsBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();

    const submission = isDispatched
      ? postponeDispatchedReservation(
          supabase,
          reservationId,
          newStartsAt,
          toClosingReadings(closings),
          workerId
        )
      : postponeScheduledReservation(
          supabase,
          reservationId,
          newStartsAt,
          workerId
        );

    void submission.then(onPostponed).catch(() => {
      setIsBusy(false);
      setError(RESERVATION_DETAIL_SCREEN.POSTPONE.ERROR);
    });
  };

  return {
    closings,
    date,
    error,
    handleDateChange: setDate,
    handleFuelChange,
    handleSubmit,
    handleTimeChange: setTime,
    handleUsageChange,
    isBusy,
    isDispatched,
    isLoadingClosings,
    time,
  };
};
