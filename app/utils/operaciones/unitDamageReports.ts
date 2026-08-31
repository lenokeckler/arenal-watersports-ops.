import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  OPERATIONS_SIGNATURE,
  UNIT_STATUS,
  type DamageCause,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { fetchWorkerNames } from "./workerNames";

export interface UnitDamageReportRow {
  authorName: string;
  cause: DamageCause;
  createdAt: string;
  description: string;
  id: string;
  impactDelta: number;
  reservationCode: Nullable<string>;
}

/**
 * US-OPE-013 raised from the machine's own ficha instead of from a close:
 * there is no reservation behind it, which is exactly the case US-OPE-020
 * describes — "alguien encuentra un golpe cuando no hay ninguna reserva de
 * por medio".
 */
export interface StandaloneDamageReportInput {
  cause: DamageCause;
  description: string;
  impactDelta: number;
  previousImpactCount: number;
  takeOutOfService: boolean;
  unitId: string;
  workerId: string;
}

interface DamageReportQueryRow {
  cause: DamageCause;
  created_at: string;
  created_by: string;
  description: string;
  id: string;
  impact_delta: number;
  reservations: Nullable<{ code: string }>;
}

const DAMAGE_REPORT_SELECT =
  "id, cause, description, impact_delta, created_at, created_by, " +
  "reservations(code)";

/**
 * US-OPE-014: the previous damage reports of one machine, newest first —
 * "los reportes se consultan después, no solamente se registran". The
 * author's name is resolved through `fetchWorkerNames` because RNF-023
 * shows the signature in the history, and a colleague's `workers` row is
 * private.
 */
export const fetchUnitDamageReports = async (
  supabase: SupabaseClient<Database>,
  unitId: string
): Promise<UnitDamageReportRow[]> => {
  const { data, error } = await supabase
    .from("damage_reports")
    .select(DAMAGE_REPORT_SELECT)
    .eq("unit_id", unitId)
    .order("created_at", { ascending: false });
  throwIfSupabaseError(
    error,
    "operaciones.unitDamageReports.fetchUnitDamageReports"
  );

  const rows = (data ??
    []) as unknown as DamageReportQueryRow[];
  const authorNames = await fetchWorkerNames(
    supabase,
    rows.map((row) => row.created_by)
  );

  return rows.map((row) => ({
    authorName:
      authorNames.get(row.created_by) ??
      OPERATIONS_SIGNATURE.UNKNOWN_AUTHOR,
    cause: row.cause,
    createdAt: row.created_at,
    description: row.description,
    id: row.id,
    impactDelta: row.impact_delta,
    reservationCode: row.reservations?.code ?? null,
  }));
};

const bumpImpactCount = async (
  supabase: SupabaseClient<Database>,
  report: StandaloneDamageReportInput
): Promise<void> => {
  const patch = {
    impact_count:
      report.previousImpactCount + report.impactDelta,
    updated_by: report.workerId,
    ...(report.takeOutOfService
      ? { status: UNIT_STATUS.DAMAGED }
      : {}),
  };

  const { error } = await supabase
    .from("equipment_units")
    .update(patch)
    .eq("id", report.unitId);
  throwIfSupabaseError(
    error,
    "operaciones.unitDamageReports.bumpImpactCount"
  );
};

/**
 * US-OPE-013: files the report over the unit's ficha and moves its impact
 * count by exactly what the operator declared. Taking the machine out of
 * availability is a separate decision (US-OPE-017) and travels as its own
 * flag — a scratch worth documenting does not always stop a jet ski.
 */
export const createStandaloneDamageReport = async (
  supabase: SupabaseClient<Database>,
  report: StandaloneDamageReportInput
): Promise<void> => {
  const { error } = await supabase
    .from("damage_reports")
    .insert({
      cause: report.cause,
      created_by: report.workerId,
      description: report.description,
      impact_delta: report.impactDelta,
      unit_id: report.unitId,
    });
  throwIfSupabaseError(
    error,
    "operaciones.unitDamageReports.createStandaloneDamageReport"
  );

  await bumpImpactCount(supabase, report);
};
