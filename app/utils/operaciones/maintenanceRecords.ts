import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  OPERATIONS_SIGNATURE,
  type CurrencyCode,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { fetchWorkerNames } from "./workerNames";

export interface MaintenanceRecordRow {
  authorName: string;
  costAmount: Nullable<number>;
  costCurrency: Nullable<CurrencyCode>;
  description: Nullable<string>;
  id: string;
  isExternal: boolean;
  performedAt: string;
  workType: string;
}

/**
 * US-OPE-018. `nextOilChangeAt` is not part of the record itself: it is the
 * threshold on the unit's ficha that an oil change resets (US-OPE-012), and
 * without moving it the alert would never clear.
 */
export interface MaintenanceRecordInput {
  costAmount: Nullable<number>;
  costCurrency: Nullable<CurrencyCode>;
  description: Nullable<string>;
  isExternal: boolean;
  nextOilChangeAt: Nullable<number>;
  performedAt: string;
  unitId: string;
  workType: string;
  workerId: string;
}

interface MaintenanceQueryRow {
  cost_amount: Nullable<number>;
  cost_currency: Nullable<CurrencyCode>;
  created_by: string;
  description: Nullable<string>;
  id: string;
  is_external: boolean;
  performed_at: string;
  work_type: string;
}

const MAINTENANCE_SELECT =
  "id, work_type, description, is_external, cost_amount, " +
  "cost_currency, performed_at, created_by";

/**
 * US-OPE-019: everything ever done to one machine, newest first. This is
 * the same table administración's maintenance-cost report reads
 * (US-ADM-030) — `maintenance_select` is open to any authenticated worker
 * on purpose, and it is the one place operaciones does handle an amount:
 * a new hull guard is a real cost of that machine, not a customer payment.
 */
export const fetchMaintenanceRecords = async (
  supabase: SupabaseClient<Database>,
  unitId: string
): Promise<MaintenanceRecordRow[]> => {
  const { data, error } = await supabase
    .from("maintenance_records")
    .select(MAINTENANCE_SELECT)
    .eq("unit_id", unitId)
    .order("performed_at", { ascending: false });
  throwIfSupabaseError(
    error,
    "operaciones.maintenanceRecords.fetchMaintenanceRecords"
  );

  const rows = (data ??
    []) as unknown as MaintenanceQueryRow[];
  const authorNames = await fetchWorkerNames(
    supabase,
    rows.map((row) => row.created_by)
  );

  return rows.map((row) => ({
    authorName:
      authorNames.get(row.created_by) ??
      OPERATIONS_SIGNATURE.UNKNOWN_AUTHOR,
    costAmount: row.cost_amount,
    costCurrency: row.cost_currency,
    description: row.description,
    id: row.id,
    isExternal: row.is_external,
    performedAt: row.performed_at,
    workType: row.work_type,
  }));
};

const moveOilChangeThreshold = async (
  supabase: SupabaseClient<Database>,
  record: MaintenanceRecordInput
): Promise<void> => {
  const { error } = await supabase
    .from("equipment_units")
    .update({
      next_oil_change_at: record.nextOilChangeAt,
      updated_by: record.workerId,
    })
    .eq("id", record.unitId);
  throwIfSupabaseError(
    error,
    "operaciones.maintenanceRecords.moveOilChangeThreshold"
  );
};

/**
 * US-OPE-018: files one job with its date, and — only when the operator
 * declared a new one — moves the unit's oil-change threshold so the alert
 * that sent the machine to the workshop stops firing.
 */
export const createMaintenanceRecord = async (
  supabase: SupabaseClient<Database>,
  record: MaintenanceRecordInput
): Promise<void> => {
  const { error } = await supabase
    .from("maintenance_records")
    .insert({
      cost_amount: record.costAmount,
      cost_currency: record.costCurrency,
      created_by: record.workerId,
      description: record.description,
      is_external: record.isExternal,
      performed_at: record.performedAt,
      unit_id: record.unitId,
      updated_by: record.workerId,
      work_type: record.workType,
    });
  throwIfSupabaseError(
    error,
    "operaciones.maintenanceRecords.createMaintenanceRecord"
  );

  if (record.nextOilChangeAt !== null) {
    await moveOilChangeThreshold(supabase, record);
  }
};
