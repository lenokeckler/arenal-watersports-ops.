import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { RESERVATION_STATUS } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  applyEquipmentClosingReadings,
  type UnitClosingReading,
} from "@/app/utils/reservas/closeEquipmentReadings";
import {
  recordDamageReports,
  type DamageReportInput,
} from "./damageReport";

export interface CloseReservationParams {
  closings: UnitClosingReading[];
  damageReports: DamageReportInput[];
  reservationId: string;
  workerId: string;
}

/**
 * US-OPE-009: registers how the equipment came back (shared with US-RES-020
 * via `applyEquipmentClosingReadings`), files whatever damage reports were
 * raised, and only then moves the reservation to `closed` — in that order,
 * so a failed equipment write never leaves a reservation closed with no
 * record of what returned. `damage_reports`/unit status updates only run
 * when `damageReports` is non-empty: "si todo está en orden, queda
 * constancia" needs no extra write beyond the equipment readings.
 */
export const closeReservation = async (
  supabase: SupabaseClient<Database>,
  params: CloseReservationParams
): Promise<void> => {
  if (params.closings.length > 0) {
    await applyEquipmentClosingReadings(
      supabase,
      params.closings,
      params.workerId
    );
  }

  if (params.damageReports.length > 0) {
    await recordDamageReports(
      supabase,
      params.damageReports,
      params.reservationId,
      params.workerId
    );
  }

  const { error } = await supabase
    .from("reservations")
    .update({
      closed_at: new Date().toISOString(),
      status: RESERVATION_STATUS.CLOSED,
      updated_by: params.workerId,
    })
    .eq("id", params.reservationId)
    .eq("status", RESERVATION_STATUS.DISPATCHED);
  throwIfSupabaseError(
    error,
    "operaciones.closeReservation.closeReservation"
  );
};
