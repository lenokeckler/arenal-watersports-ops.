import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  CATEGORY_STATUS,
  UNIT_STATUS,
  type UnitStatus,
  type UsageMetric,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

/** One machine as it reads on `/operaciones/maquinas`, before grouping. */
export interface MachineListUnit {
  categoryId: string;
  categoryName: string;
  code: string;
  consumesFuel: boolean;
  fuelLevel: Nullable<number>;
  fuelMax: number;
  hasMotor: boolean;
  id: string;
  impactCount: number;
  isOilChangeDue: boolean;
  status: UnitStatus;
  usageMetric: Nullable<UsageMetric>;
  usageTotal: number;
}

interface MachineListQueryRow {
  category_id: string;
  code: string;
  equipment_categories: {
    consumes_fuel: boolean;
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

interface ServiceStatusUnitIdRow {
  unit_id: string;
}

const MACHINE_LIST_SELECT =
  "id, category_id, code, status, fuel_level, fuel_max, usage_total, impact_count, " +
  "equipment_categories!inner(name, has_motor, consumes_fuel, usage_metric)";

const toMachineListUnit = (
  row: MachineListQueryRow,
  dueUnitIds: ReadonlySet<string>
): MachineListUnit => ({
  categoryId: row.category_id,
  categoryName: row.equipment_categories.name,
  code: row.code,
  consumesFuel: row.equipment_categories.consumes_fuel,
  fuelLevel: row.fuel_level,
  fuelMax: row.fuel_max,
  hasMotor: row.equipment_categories.has_motor,
  id: row.id,
  impactCount: row.impact_count,
  isOilChangeDue: dueUnitIds.has(row.id),
  status: row.status,
  usageMetric: row.equipment_categories.usage_metric,
  usageTotal: row.usage_total,
});

/**
 * The flat list behind `/operaciones/maquinas` (US-OPE-020): only units
 * whose category has a motor or consumes fuel land here — a by_quantity
 * category like kayaks has neither an hour meter nor a tank, and its stock
 * already lives in `/operaciones/inventario`. `is_oil_change_due` comes
 * from `unit_service_status` rather than a client-side comparison against
 * `next_oil_change_at`, same reason that view exists at all: the threshold
 * rule stays in the database, not recomputed here. Grouping by category is
 * a separate, pure step — see `machineListGrouping.ts`.
 */
export const fetchMachineList = async (
  supabase: SupabaseClient<Database>
): Promise<MachineListUnit[]> => {
  const [unitsResult, dueResult] = await Promise.all([
    supabase
      .from("equipment_units")
      .select(MACHINE_LIST_SELECT)
      .neq("status", UNIT_STATUS.DECOMMISSIONED)
      .eq(
        "equipment_categories.status",
        CATEGORY_STATUS.ACTIVE
      )
      .or("has_motor.eq.true,consumes_fuel.eq.true", {
        foreignTable: "equipment_categories",
      })
      .order("code"),
    supabase
      .from("unit_service_status")
      .select("unit_id")
      .eq("is_oil_change_due", true),
  ]);
  throwIfSupabaseError(
    unitsResult.error,
    "operaciones.machineList.fetchMachineList.units"
  );
  throwIfSupabaseError(
    dueResult.error,
    "operaciones.machineList.fetchMachineList.serviceStatus"
  );

  const dueUnitIds = new Set(
    (
      (dueResult.data ??
        []) as unknown as ServiceStatusUnitIdRow[]
    ).map((row) => row.unit_id)
  );
  const rows = (unitsResult.data ??
    []) as unknown as MachineListQueryRow[];

  return rows.map((row) =>
    toMachineListUnit(row, dueUnitIds)
  );
};
