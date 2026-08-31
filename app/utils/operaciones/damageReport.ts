import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  UNIT_STATUS,
  type DamageCause,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/**
 * US-OPE-013: what operaciones fills in when a unit comes back damaged.
 * `previousImpactCount` travels with the input because the caller already
 * has it from the same fetch that listed the unit — this never re-reads it
 * to compute the new total.
 */
export interface DamageReportInput {
  cause: DamageCause;
  description: string;
  impactDelta: number;
  itemId: string;
  previousImpactCount: number;
  unitId: string;
}

const insertDamageReport = async (
  supabase: SupabaseClient<Database>,
  report: DamageReportInput,
  reservationId: string,
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("damage_reports")
    .insert({
      cause: report.cause,
      created_by: workerId,
      description: report.description,
      impact_delta: report.impactDelta,
      reservation_id: reservationId,
      unit_id: report.unitId,
    });
  throwIfSupabaseError(
    error,
    "operaciones.damageReport.insertDamageReport"
  );
};

const markUnitDamaged = async (
  supabase: SupabaseClient<Database>,
  report: DamageReportInput,
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("equipment_units")
    .update({
      impact_count:
        report.previousImpactCount + report.impactDelta,
      status: UNIT_STATUS.DAMAGED,
      updated_by: workerId,
    })
    .eq("id", report.unitId);
  throwIfSupabaseError(
    error,
    "operaciones.damageReport.markUnitDamaged"
  );
};

/**
 * US-OPE-009/US-OPE-013: files the report and marks the unit `damaged` in
 * the same move — this is what reservas later reads to decide the deposit
 * (US-RES-030), and what the damage-report history (US-OPE-014, a later
 * dispatch) will list. Only reaches units with a ficha
 * (`damage_reports.unit_id` is not nullable): a by_quantity category never
 * produces one from this screen.
 */
export const recordDamageReports = async (
  supabase: SupabaseClient<Database>,
  reports: DamageReportInput[],
  reservationId: string,
  workerId: string
): Promise<void> => {
  await Promise.all(
    reports.flatMap((report) => [
      insertDamageReport(
        supabase,
        report,
        reservationId,
        workerId
      ),
      markUnitDamaged(supabase, report, workerId),
    ])
  );
};
