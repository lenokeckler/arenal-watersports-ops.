"use client";

import { useState } from "react";
import { DISPATCH_SCREEN } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import type { ReservationEquipmentItem } from "@/app/utils/reservas/reservationEquipmentItems";
import {
  buildDispatchSheetRows,
  parseReadingValue,
  type DispatchSheetRow,
} from "@/app/utils/reservas/equipmentReadingFields";
import { dispatchReservation } from "@/app/utils/operaciones/dispatchReservation";

interface UseDispatchReadingsStepViewModelParams {
  items: ReservationEquipmentItem[];
  onDispatched: () => void;
  reservationId: string;
  workerId: string;
}

export interface UseDispatchReadingsStepViewModelReturn {
  error: Nullable<string>;
  handleFuelChange: (itemId: string, value: string) => void;
  handleSubmit: () => void;
  handleUsageChange: (
    itemId: string,
    value: string
  ) => void;
  isBusy: boolean;
  rows: DispatchSheetRow[];
}

const mapReading = (
  rows: DispatchSheetRow[],
  itemId: string,
  patch: (
    reading: NonNullable<DispatchSheetRow["reading"]>
  ) => NonNullable<DispatchSheetRow["reading"]>
): DispatchSheetRow[] =>
  rows.map((row) =>
    row.itemId === itemId && row.reading
      ? { ...row, reading: patch(row.reading) }
      : row
  );

const hasReading = (
  row: DispatchSheetRow
): row is DispatchSheetRow & {
  reading: NonNullable<DispatchSheetRow["reading"]>;
} => row.reading !== null;

/**
 * US-OPE-002/US-OPE-003: one row per item the reservation commits — see
 * `buildDispatchSheetRows` for why kayaks and paddleboards still show up
 * with no reading to fill — and dispatches with whatever was typed for the
 * units that do take one.
 */
export const useDispatchReadingsStepViewModel = ({
  items,
  onDispatched,
  reservationId,
  workerId,
}: UseDispatchReadingsStepViewModelParams): UseDispatchReadingsStepViewModelReturn => {
  const [rows, setRows] = useState<DispatchSheetRow[]>(() =>
    buildDispatchSheetRows(items)
  );
  const [error, setError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleFuelChange = (
    itemId: string,
    value: string
  ): void =>
    setRows((current) =>
      mapReading(current, itemId, (reading) => ({
        ...reading,
        fuelPercent: value,
      }))
    );

  const handleUsageChange = (
    itemId: string,
    value: string
  ): void =>
    setRows((current) =>
      mapReading(current, itemId, (reading) => ({
        ...reading,
        usageReading: value,
      }))
    );

  const handleSubmit = (): void => {
    setIsBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();

    void dispatchReservation(
      supabase,
      reservationId,
      rows.filter(hasReading).map((row) => ({
        fuelPercent: parseReadingValue(
          row.reading.fuelPercent
        ),
        itemId: row.itemId,
        unitId: row.reading.unitId,
        usageReading: parseReadingValue(
          row.reading.usageReading
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
    rows,
  };
};
