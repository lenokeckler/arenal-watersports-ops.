"use client";

import { useEffect, useState } from "react";
import { DISPATCH_SCREEN } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { fetchReservationEquipmentItems } from "@/app/utils/reservas/reservationEquipmentItems";
import {
  buildEquipmentReadingFields,
  parseReadingValue,
  type EquipmentReadingFieldState,
} from "@/app/utils/reservas/equipmentReadingFields";
import { dispatchReservation } from "@/app/utils/operaciones/dispatchReservation";

interface UseDispatchModalViewModelParams {
  onDispatched: () => void;
  reservationId: string;
  workerId: string;
}

export interface UseDispatchModalViewModelReturn {
  error: Nullable<string>;
  handleFuelChange: (itemId: string, value: string) => void;
  handleSubmit: () => void;
  handleUsageChange: (
    itemId: string,
    value: string
  ) => void;
  isBusy: boolean;
  isLoadingReadings: boolean;
  readings: EquipmentReadingFieldState[];
}

/**
 * US-OPE-002/US-OPE-003: loads the reservation's motorized/fuel-consuming
 * units on mount so the sheet only ever asks for a departure reading where
 * one applies, then dispatches with whatever was typed.
 */
export const useDispatchModalViewModel = ({
  onDispatched,
  reservationId,
  workerId,
}: UseDispatchModalViewModelParams): UseDispatchModalViewModelReturn => {
  const [readings, setReadings] = useState<
    EquipmentReadingFieldState[]
  >([]);
  const [isLoadingReadings, setIsLoadingReadings] =
    useState(true);
  const [error, setError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    void fetchReservationEquipmentItems(
      supabase,
      reservationId
    ).then((items) => {
      setReadings(buildEquipmentReadingFields(items));
      setIsLoadingReadings(false);
    });
    // Runs once per modal mount — a fresh reservationId always remounts it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFuelChange = (
    itemId: string,
    value: string
  ): void => {
    setReadings((current) =>
      current.map((reading) =>
        reading.itemId === itemId
          ? { ...reading, fuelPercent: value }
          : reading
      )
    );
  };

  const handleUsageChange = (
    itemId: string,
    value: string
  ): void => {
    setReadings((current) =>
      current.map((reading) =>
        reading.itemId === itemId
          ? { ...reading, usageReading: value }
          : reading
      )
    );
  };

  const handleSubmit = (): void => {
    setIsBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();

    void dispatchReservation(
      supabase,
      reservationId,
      readings.map((reading) => ({
        fuelPercent: parseReadingValue(reading.fuelPercent),
        itemId: reading.itemId,
        usageReading: parseReadingValue(
          reading.usageReading
        ),
      })),
      workerId
    )
      .then(onDispatched)
      .catch(() => {
        setIsBusy(false);
        setError(DISPATCH_SCREEN.CONFIRM_ERROR);
      });
  };

  return {
    error,
    handleFuelChange,
    handleSubmit,
    handleUsageChange,
    isBusy,
    isLoadingReadings,
    readings,
  };
};
