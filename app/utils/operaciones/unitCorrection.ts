import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type { UnitStatus } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/**
 * US-OPE-020. Every field is optional on purpose: the operator corrects
 * what is actually wrong — somebody filled the tank, changed the oil or
 * found a scratch — and everything left `null` is not touched, so a blank
 * box never wipes a good reading.
 */
export interface UnitCorrection {
  fuelLevel: Nullable<number>;
  fuelMax: Nullable<number>;
  impactCount: Nullable<number>;
  status: Nullable<UnitStatus>;
  unitId: string;
  usageTotal: Nullable<number>;
  workerId: string;
}

interface UnitCorrectionPatch {
  fuel_level?: number;
  fuel_max?: number;
  impact_count?: number;
  status?: UnitStatus;
  updated_by: string;
  usage_total?: number;
}

const buildCorrectionPatch = (
  correction: UnitCorrection
): UnitCorrectionPatch => ({
  updated_by: correction.workerId,
  ...(correction.fuelLevel !== null
    ? { fuel_level: correction.fuelLevel }
    : {}),
  ...(correction.fuelMax !== null
    ? { fuel_max: correction.fuelMax }
    : {}),
  ...(correction.usageTotal !== null
    ? { usage_total: correction.usageTotal }
    : {}),
  ...(correction.impactCount !== null
    ? { impact_count: correction.impactCount }
    : {}),
  ...(correction.status !== null
    ? { status: correction.status }
    : {}),
});

export const hasSomethingToCorrect = (
  correction: UnitCorrection
): boolean =>
  correction.fuelLevel !== null ||
  correction.fuelMax !== null ||
  correction.usageTotal !== null ||
  correction.impactCount !== null ||
  correction.status !== null;

/**
 * US-OPE-020: adjusts what happened outside a dispatch and signs it —
 * `updated_by` is the trace RNF-022 asks for. `usage_total` receives the
 * instrument reading, the same accumulated number the close writes and
 * the usage report reads (US-ADM-028); it is never reset to a delta.
 */
export const applyUnitCorrection = async (
  supabase: SupabaseClient<Database>,
  correction: UnitCorrection
): Promise<void> => {
  const { error } = await supabase
    .from("equipment_units")
    .update(buildCorrectionPatch(correction))
    .eq("id", correction.unitId);
  throwIfSupabaseError(
    error,
    "operaciones.unitCorrection.applyUnitCorrection"
  );
};
