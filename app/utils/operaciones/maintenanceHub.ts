import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  MAINTENANCE_UNIT_STATUSES,
  type UnitStatus,
  type UsageMetric,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface ServiceAlertRow {
  categoryName: string;
  code: string;
  remainingUsage: number;
  unitId: string;
  usageMetric: Nullable<UsageMetric>;
  usageTotal: number;
}

export interface UnitOutOfServiceRow {
  categoryName: string;
  code: string;
  status: UnitStatus;
  unitId: string;
}

interface ServiceAlertQueryRow {
  category_name: string;
  code: string;
  remaining_usage: number;
  unit_id: string;
  usage_metric: Nullable<UsageMetric>;
  usage_total: number;
}

interface UnitOutOfServiceQueryRow {
  code: string;
  equipment_categories: { name: string };
  id: string;
  status: UnitStatus;
}

const SERVICE_ALERT_SELECT =
  "unit_id, code, category_name, usage_metric, usage_total, remaining_usage";

const OUT_OF_SERVICE_SELECT =
  "id, code, status, equipment_categories!inner(name)";

/**
 * US-OPE-012: the units that already reached the oil-change threshold set
 * on their own ficha. The rule lives in `unit_service_status`; this only
 * asks the view for the ones it already flagged.
 */
export const fetchServiceAlerts = async (
  supabase: SupabaseClient<Database>
): Promise<ServiceAlertRow[]> => {
  const { data, error } = await supabase
    .from("unit_service_status")
    .select(SERVICE_ALERT_SELECT)
    .eq("is_oil_change_due", true)
    .order("remaining_usage");
  throwIfSupabaseError(
    error,
    "operaciones.maintenanceHub.fetchServiceAlerts"
  );

  return (
    (data ?? []) as unknown as ServiceAlertQueryRow[]
  ).map((row) => ({
    categoryName: row.category_name,
    code: row.code,
    remainingUsage: row.remaining_usage,
    unitId: row.unit_id,
    usageMetric: row.usage_metric,
    usageTotal: row.usage_total,
  }));
};

/**
 * US-OPE-017: everything currently out of the water — in the workshop,
 * damaged or under repair. A decommissioned unit is not here: it is gone
 * from day-to-day operation, not waiting to come back.
 */
export const fetchUnitsOutOfService = async (
  supabase: SupabaseClient<Database>
): Promise<UnitOutOfServiceRow[]> => {
  const { data, error } = await supabase
    .from("equipment_units")
    .select(OUT_OF_SERVICE_SELECT)
    .in("status", MAINTENANCE_UNIT_STATUSES)
    .order("code");
  throwIfSupabaseError(
    error,
    "operaciones.maintenanceHub.fetchUnitsOutOfService"
  );

  return (
    (data ?? []) as unknown as UnitOutOfServiceQueryRow[]
  ).map((row) => ({
    categoryName: row.equipment_categories.name,
    code: row.code,
    status: row.status,
    unitId: row.id,
  }));
};
