import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type {
  CurrencyCode,
  DepositStatus,
  UsageMetric,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

// ============================ US-ADM-026: ingresos del dia ============================

export interface DailyRevenueRow {
  currency: CurrencyCode;
  grossAmount: number;
  netAmount: number;
  refundsAmount: number;
  retainedAmount: number;
}

interface DailyRevenueQueryRow {
  currency: CurrencyCode;
  gross_amount: number;
  net_amount: number;
  refunds_amount: number;
  retained_amount: number;
}

const toDailyRevenueRow = (
  row: DailyRevenueQueryRow
): DailyRevenueRow => ({
  currency: row.currency,
  grossAmount: row.gross_amount,
  netAmount: row.net_amount,
  refundsAmount: row.refunds_amount,
  retainedAmount: row.retained_amount,
});

/** US-ADM-026: ingresos de un dia especifico, ya separados por moneda por la base. */
export const fetchDailyRevenue = async (
  supabase: SupabaseClient<Database>,
  day: string
): Promise<DailyRevenueRow[]> => {
  const { data, error } = await supabase
    .from("daily_revenue_report")
    .select(
      "currency, gross_amount, refunds_amount, retained_amount, net_amount"
    )
    .eq("day", day)
    .order("currency");
  throwIfSupabaseError(error, "reports.fetchDailyRevenue");

  return (
    (data ?? []) as unknown as DailyRevenueQueryRow[]
  ).map(toDailyRevenueRow);
};

// ============================ US-ADM-027: movimiento por dia y por mes ============================

export interface DailyReservationPoint {
  day: string;
  reservationsCount: number;
}

export interface MonthlyReservationPoint {
  month: string;
  reservationsCount: number;
}

interface DailyReservationQueryRow {
  day: string;
  reservations_count: number;
}

/** US-ADM-027: salidas por dia dentro de un rango, para el grafico diario. */
export const fetchDailyReservationCounts = async (
  supabase: SupabaseClient<Database>,
  fromDay: string,
  toDay: string
): Promise<DailyReservationPoint[]> => {
  const { data, error } = await supabase
    .from("daily_reservation_counts")
    .select("day, reservations_count")
    .gte("day", fromDay)
    .lte("day", toDay)
    .order("day");
  throwIfSupabaseError(
    error,
    "reports.fetchDailyReservationCounts"
  );

  return (
    (data ?? []) as unknown as DailyReservationQueryRow[]
  ).map((row) => ({
    day: row.day,
    reservationsCount: row.reservations_count,
  }));
};

interface MonthlyReservationQueryRow {
  month: string;
  reservations_count: number;
}

/** US-ADM-027: salidas por mes dentro de un rango, para comparar temporadas. */
export const fetchMonthlyReservationCounts = async (
  supabase: SupabaseClient<Database>,
  fromMonth: string,
  toMonth: string
): Promise<MonthlyReservationPoint[]> => {
  const { data, error } = await supabase
    .from("monthly_reservation_counts")
    .select("month, reservations_count")
    .gte("month", fromMonth)
    .lte("month", toMonth)
    .order("month");
  throwIfSupabaseError(
    error,
    "reports.fetchMonthlyReservationCounts"
  );

  return (
    (data ?? []) as unknown as MonthlyReservationQueryRow[]
  ).map((row) => ({
    month: row.month,
    reservationsCount: row.reservations_count,
  }));
};

export interface DailyRevenuePoint {
  currency: CurrencyCode;
  day: string;
  netAmount: number;
}

interface DailyRevenueRangeQueryRow {
  currency: CurrencyCode;
  day: string;
  net_amount: number;
}

/** US-ADM-027: ingresos netos por dia dentro de un rango, separados por moneda. */
export const fetchDailyRevenueRange = async (
  supabase: SupabaseClient<Database>,
  fromDay: string,
  toDay: string
): Promise<DailyRevenuePoint[]> => {
  const { data, error } = await supabase
    .from("daily_revenue_report")
    .select("day, currency, net_amount")
    .gte("day", fromDay)
    .lte("day", toDay)
    .order("day");
  throwIfSupabaseError(
    error,
    "reports.fetchDailyRevenueRange"
  );

  return (
    (data ?? []) as unknown as DailyRevenueRangeQueryRow[]
  ).map((row) => ({
    currency: row.currency,
    day: row.day,
    netAmount: row.net_amount,
  }));
};

// ============================ US-ADM-028: horas de uso por equipo ============================

export interface UnitUsageRow {
  categoryName: string;
  code: string;
  id: string;
  usageMetric: Nullable<UsageMetric>;
  usageTotal: number;
}

interface UnitUsageQueryRow {
  code: string;
  equipment_categories: {
    name: string;
    usage_metric: Nullable<UsageMetric>;
  } | null;
  id: string;
  usage_total: number;
}

/**
 * US-ADM-028: `usage_total` ya es el acumulado que operaciones registra al
 * cerrar cada salida — no se recalcula aqui a partir de reservation_items,
 * se lee tal cual, ordenado de mas usado a menos. Solo entran unidades cuya
 * categoria lleva motor: una sin motor nunca acumula uso, asi que no aporta
 * nada a "cuales se usan y cuales estan parqueados" (US-ADM-028). El `!inner`
 * es necesario para que el filtro sobre la categoria realmente reduzca las
 * filas, no solo el objeto embebido.
 */
export const fetchUnitUsageReport = async (
  supabase: SupabaseClient<Database>
): Promise<UnitUsageRow[]> => {
  const { data, error } = await supabase
    .from("equipment_units")
    .select(
      "id, code, usage_total, equipment_categories!inner(name, usage_metric, has_motor)"
    )
    .eq("equipment_categories.has_motor", true)
    .order("usage_total", { ascending: false });
  throwIfSupabaseError(
    error,
    "reports.fetchUnitUsageReport"
  );

  return (
    (data ?? []) as unknown as UnitUsageQueryRow[]
  ).map((row) => ({
    categoryName: row.equipment_categories?.name ?? "",
    code: row.code,
    id: row.id,
    usageMetric:
      row.equipment_categories?.usage_metric ?? null,
    usageTotal: row.usage_total,
  }));
};

// ============================ US-ADM-029: reservas por trabajador ============================

export interface WorkerReservationsRow {
  firstReservationAt: string;
  lastReservationAt: string;
  reservationsCount: number;
  workerId: string;
  workerName: string;
}

interface WorkerReservationsQueryRow {
  first_reservation_at: string;
  last_reservation_at: string;
  reservations_count: number;
  worker_id: string;
  worker_name: string;
}

/** US-ADM-029: sale de la firma que queda en cada reserva (reservations_by_worker). */
export const fetchReservationsByWorker = async (
  supabase: SupabaseClient<Database>
): Promise<WorkerReservationsRow[]> => {
  const { data, error } = await supabase
    .from("reservations_by_worker")
    .select(
      "worker_id, worker_name, reservations_count, first_reservation_at, last_reservation_at"
    )
    .order("reservations_count", { ascending: false });
  throwIfSupabaseError(
    error,
    "reports.fetchReservationsByWorker"
  );

  return (
    (data ?? []) as unknown as WorkerReservationsQueryRow[]
  ).map((row) => ({
    firstReservationAt: row.first_reservation_at,
    lastReservationAt: row.last_reservation_at,
    reservationsCount: row.reservations_count,
    workerId: row.worker_id,
    workerName: row.worker_name,
  }));
};

// ============================ US-ADM-030: costo de mantenimiento ============================

export interface MaintenanceCostRow {
  currency: CurrencyCode;
  lastPerformedAt: string;
  recordsCount: number;
  totalCost: number;
  unitCode: string;
  unitId: string;
}

interface MaintenanceCostQueryRow {
  currency: CurrencyCode;
  last_performed_at: string;
  records_count: number;
  total_cost: number;
  unit_code: string;
  unit_id: string;
}

/** US-ADM-030: se construye del historial de mantenimiento (maintenance_cost_by_unit). */
export const fetchMaintenanceCostByUnit = async (
  supabase: SupabaseClient<Database>
): Promise<MaintenanceCostRow[]> => {
  const { data, error } = await supabase
    .from("maintenance_cost_by_unit")
    .select(
      "unit_id, unit_code, currency, total_cost, records_count, last_performed_at"
    )
    .order("total_cost", { ascending: false });
  throwIfSupabaseError(
    error,
    "reports.fetchMaintenanceCostByUnit"
  );

  return (
    (data ?? []) as unknown as MaintenanceCostQueryRow[]
  ).map((row) => ({
    currency: row.currency,
    lastPerformedAt: row.last_performed_at,
    recordsCount: row.records_count,
    totalCost: row.total_cost,
    unitCode: row.unit_code,
    unitId: row.unit_id,
  }));
};

// ============================ US-ADM-031: depositos pendientes y retenidos ============================

export interface DepositRow {
  amount: number;
  currency: CurrencyCode;
  customerName: string;
  id: string;
  reservationCode: string;
  retainedAmount: Nullable<number>;
  retentionReason: Nullable<string>;
  status: DepositStatus;
}

interface DepositQueryRow {
  amount: number;
  currency: CurrencyCode;
  id: string;
  reservations: {
    code: string;
    customer_name: string;
  } | null;
  retained_amount: Nullable<number>;
  retention_reason: Nullable<string>;
  status: DepositStatus;
}

const toDepositRow = (
  row: DepositQueryRow
): DepositRow => ({
  amount: row.amount,
  currency: row.currency,
  customerName: row.reservations?.customer_name ?? "",
  id: row.id,
  reservationCode: row.reservations?.code ?? "",
  retainedAmount: row.retained_amount,
  retentionReason: row.retention_reason,
  status: row.status,
});

const DEPOSIT_SELECT =
  "id, amount, currency, status, retained_amount, retention_reason, " +
  "reservations(code, customer_name)";

/** US-ADM-031: depositos que la empresa todavia tiene en la mano, sin resolver. */
export const fetchPendingDeposits = async (
  supabase: SupabaseClient<Database>
): Promise<DepositRow[]> => {
  const { data, error } = await supabase
    .from("deposits")
    .select(DEPOSIT_SELECT)
    .eq("status", "held")
    .order("created_at");
  throwIfSupabaseError(
    error,
    "reports.fetchPendingDeposits"
  );

  return ((data ?? []) as unknown as DepositQueryRow[]).map(
    toDepositRow
  );
};

/** US-ADM-031: dinero que la empresa se quedo por un dano, con su motivo. */
export const fetchRetainedDeposits = async (
  supabase: SupabaseClient<Database>
): Promise<DepositRow[]> => {
  const { data, error } = await supabase
    .from("deposits")
    .select(DEPOSIT_SELECT)
    .in("status", ["retained", "partially_retained"])
    .order("resolved_at", { ascending: false });
  throwIfSupabaseError(
    error,
    "reports.fetchRetainedDeposits"
  );

  return ((data ?? []) as unknown as DepositQueryRow[]).map(
    toDepositRow
  );
};
