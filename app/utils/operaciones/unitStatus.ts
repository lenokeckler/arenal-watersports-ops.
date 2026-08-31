import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  UNIT_STATUS,
  type UnitStatus,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/**
 * US-OPE-017 and US-OPE-022 are the same write seen from two screens: a
 * unit leaves availability by changing status, never by being deleted.
 * `unit_current_state` already reports anything other than `available` as
 * unavailable, so the board stops offering it the moment this lands —
 * "el tablero deja de ofrecerla en ese mismo momento".
 *
 * A decommissioned unit is excluded: bringing one back is US-ADM-018's
 * decision, with its own reason and date, not a status tap here.
 */
export const updateUnitStatus = async (
  supabase: SupabaseClient<Database>,
  unitId: string,
  status: UnitStatus,
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("equipment_units")
    .update({ status, updated_by: workerId })
    .eq("id", unitId)
    .neq("status", UNIT_STATUS.DECOMMISSIONED);
  throwIfSupabaseError(
    error,
    "operaciones.unitStatus.updateUnitStatus"
  );
};
