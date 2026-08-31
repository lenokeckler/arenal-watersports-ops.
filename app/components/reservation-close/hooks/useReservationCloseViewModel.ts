"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PATHS,
  RESERVATION_CLOSE_SCREEN,
  type DamageCause,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { parseReadingValue } from "@/app/utils/reservas/equipmentReadingFields";
import { closeReservation } from "@/app/utils/operaciones/closeReservation";
import type { DamageReportInput } from "@/app/utils/operaciones/damageReport";
import type { ReservationCloseEquipmentRow } from "@/app/utils/operaciones/reservationCloseRows";
import { useReservationCloseRowsViewModel } from "./useReservationCloseRowsViewModel";
import type { ReservationCloseProps } from "../models/ReservationCloseProps.interface";
import type { ReservationCloseViewModel } from "../models/ReservationCloseViewModel.interface";

const validateDamageReports = (
  rows: ReservationCloseEquipmentRow[]
): Nullable<string> => {
  for (const row of rows) {
    if (!row.isReportingDamage) {
      continue;
    }
    if (!row.damageCause) {
      return RESERVATION_CLOSE_SCREEN.DAMAGE.CAUSE_REQUIRED;
    }
    if (!row.damageDescription.trim()) {
      return RESERVATION_CLOSE_SCREEN.DAMAGE
        .DESCRIPTION_REQUIRED;
    }
  }
  return null;
};

const toDamageReports = (
  rows: ReservationCloseEquipmentRow[]
): DamageReportInput[] =>
  rows
    .filter((row) => row.isReportingDamage)
    .map((row) => ({
      cause: row.damageCause as DamageCause,
      description: row.damageDescription.trim(),
      impactDelta:
        parseReadingValue(row.damageImpactDelta) ?? 0,
      itemId: row.itemId,
      previousImpactCount: row.impactCount,
      unitId: row.unitId,
    }));

/**
 * US-OPE-009: one row per returning unit, with fuel/hours always editable
 * and a damage report the operator opts into per unit. Validates only the
 * rows that opted in — "si todo está en orden, queda constancia" needs
 * nothing more than the readings. Row state itself lives in
 * `useReservationCloseRowsViewModel`; this hook only validates and submits.
 */
export const useReservationCloseViewModel = ({
  data,
  workerId,
}: ReservationCloseProps): ReservationCloseViewModel => {
  const router = useRouter();
  const rowsViewModel = useReservationCloseRowsViewModel(
    data.items
  );
  const [error, setError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = (): void => {
    const validationError = validateDamageReports(
      rowsViewModel.rows
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsBusy(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();

    void closeReservation(supabase, {
      closings: rowsViewModel.rows
        .filter((row) => row.showFuel || row.showUsage)
        .map((row) => ({
          fuelPercent: parseReadingValue(row.fuelPercent),
          itemId: row.itemId,
          unitId: row.unitId,
          usageReading: parseReadingValue(row.usageReading),
        })),
      damageReports: toDamageReports(rowsViewModel.rows),
      reservationId: data.id,
      workerId,
    })
      .then(() => router.push(PATHS.OPERATIONS.ROOT))
      .catch(() => {
        setIsBusy(false);
        setError(RESERVATION_CLOSE_SCREEN.ERROR);
      });
  };

  return {
    ...rowsViewModel,
    error,
    handleSubmit,
    isBusy,
  };
};
