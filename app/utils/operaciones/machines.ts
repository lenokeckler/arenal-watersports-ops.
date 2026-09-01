import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type {
  UnitStatus,
  UsageMetric,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/**
 * US-OPE-012: read straight off `unit_service_status`, the view that owns
 * the "ya alcanzó su umbral" rule. Nothing here recomputes it.
 */
export interface MachineServiceStatus {
  isOilChangeDue: boolean;
  nextOilChangeAt: number;
  remainingUsage: number;
}

export interface MachineDetail {
  categoryId: string;
  categoryName: string;
  code: string;
  consumesFuel: boolean;
  fuelLevel: Nullable<number>;
  fuelMax: number;
  hasConditionPhotos: boolean;
  hasMotor: boolean;
  id: string;
  impactCount: number;
  serviceStatus: Nullable<MachineServiceStatus>;
  status: UnitStatus;
  usageMetric: Nullable<UsageMetric>;
  usageTotal: number;
}

interface MachineQueryRow {
  category_id: string;
  code: string;
  equipment_categories: {
    consumes_fuel: boolean;
    has_condition_photos: boolean;
    has_motor: boolean;
    name: string;
    usage_metric: Nullable<UsageMetric>;
  };
  fuel_level: Nullable<number>;
  fuel_max: number;
  id: string;
  impact_count: number;
  status: UnitStatus;
  usage_total: number;
}

interface ServiceStatusQueryRow {
  is_oil_change_due: boolean;
  next_oil_change_at: number;
  remaining_usage: number;
}

const MACHINE_SELECT =
  "id, category_id, code, status, fuel_level, fuel_max, usage_total, impact_count, " +
  "equipment_categories!inner(name, has_motor, usage_metric, " +
  "consumes_fuel, has_condition_photos)";

const SERVICE_STATUS_SELECT =
  "next_oil_change_at, remaining_usage, is_oil_change_due";

const toServiceStatus = (
  row: Nullable<ServiceStatusQueryRow>
): Nullable<MachineServiceStatus> =>
  row
    ? {
        isOilChangeDue: row.is_oil_change_due,
        nextOilChangeAt: row.next_oil_change_at,
        remainingUsage: row.remaining_usage,
      }
    : null;

const toMachineDetail = (
  row: MachineQueryRow,
  serviceStatus: Nullable<MachineServiceStatus>
): MachineDetail => ({
  categoryId: row.category_id,
  categoryName: row.equipment_categories.name,
  code: row.code,
  consumesFuel: row.equipment_categories.consumes_fuel,
  fuelLevel: row.fuel_level,
  fuelMax: row.fuel_max,
  hasConditionPhotos:
    row.equipment_categories.has_condition_photos,
  hasMotor: row.equipment_categories.has_motor,
  id: row.id,
  impactCount: row.impact_count,
  serviceStatus,
  status: row.status,
  usageMetric: row.equipment_categories.usage_metric,
  usageTotal: row.usage_total,
});

/**
 * The ficha behind `/operaciones/maquinas/[unitId]` (US-OPE-010,
 * US-OPE-011, US-OPE-012, US-OPE-016). The category travels with the unit
 * because what the screen may show depends on it: fuel only where the
 * category consumes it, usage only where it has a motor, photos only where
 * the category keeps them.
 */
export const fetchMachineDetail = async (
  supabase: SupabaseClient<Database>,
  unitId: string
): Promise<Nullable<MachineDetail>> => {
  const [unitResult, serviceResult] = await Promise.all([
    supabase
      .from("equipment_units")
      .select(MACHINE_SELECT)
      .eq("id", unitId)
      .maybeSingle(),
    supabase
      .from("unit_service_status")
      .select(SERVICE_STATUS_SELECT)
      .eq("unit_id", unitId)
      .maybeSingle(),
  ]);
  throwIfSupabaseError(
    unitResult.error,
    "operaciones.machines.fetchMachineDetail.unit"
  );
  throwIfSupabaseError(
    serviceResult.error,
    "operaciones.machines.fetchMachineDetail.serviceStatus"
  );

  if (!unitResult.data) {
    return null;
  }

  return toMachineDetail(
    unitResult.data as unknown as MachineQueryRow,
    toServiceStatus(
      serviceResult.data as unknown as Nullable<ServiceStatusQueryRow>
    )
  );
};
