import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type {
  CategoryStatus,
  TrackingMode,
  UsageMetric,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface CategoriesFilters {
  search: Nullable<string>;
  status: Nullable<CategoryStatus>;
  trackingMode: Nullable<TrackingMode>;
}

export interface CategoryListRow {
  id: string;
  isReservable: boolean;
  name: string;
  status: CategoryStatus;
  trackingMode: TrackingMode;
}

export interface CategoriesPage {
  rows: CategoryListRow[];
  totalCount: number;
}

export interface CategoryDetail extends CategoryListRow {
  alertExpiryDays: Nullable<number>;
  alertMinQuantity: Nullable<number>;
  canBeDamaged: boolean;
  consumesFuel: boolean;
  defaultDurationMinutes: Nullable<number>;
  depositCrc: Nullable<number>;
  depositUsd: Nullable<number>;
  guideOnly: boolean;
  hasConditionPhotos: boolean;
  hasMotor: boolean;
  usageMetric: Nullable<UsageMetric>;
}

const CATEGORY_LIST_SELECT =
  "id, name, status, tracking_mode, is_reservable";

const CATEGORY_DETAIL_SELECT =
  "id, name, status, tracking_mode, is_reservable, has_motor, " +
  "usage_metric, consumes_fuel, can_be_damaged, has_condition_photos, " +
  "guide_only, default_duration_minutes, deposit_usd, deposit_crc, " +
  "alert_min_quantity, alert_expiry_days";

/**
 * The database answers in snake_case and the screens read camelCase, and
 * concatenating a select string costs PostgREST its row inference. Both
 * shapes are declared here and mapped explicitly, the same way
 * `fetchWorkersPage` does for `workers`.
 */
interface CategoryListQueryRow {
  id: string;
  is_reservable: boolean;
  name: string;
  status: CategoryStatus;
  tracking_mode: TrackingMode;
}

interface CategoryDetailQueryRow extends CategoryListQueryRow {
  alert_expiry_days: Nullable<number>;
  alert_min_quantity: Nullable<number>;
  can_be_damaged: boolean;
  consumes_fuel: boolean;
  default_duration_minutes: Nullable<number>;
  deposit_crc: Nullable<number>;
  deposit_usd: Nullable<number>;
  guide_only: boolean;
  has_condition_photos: boolean;
  has_motor: boolean;
  usage_metric: Nullable<UsageMetric>;
}

const toCategoryListRow = (
  row: CategoryListQueryRow
): CategoryListRow => ({
  id: row.id,
  isReservable: row.is_reservable,
  name: row.name,
  status: row.status,
  trackingMode: row.tracking_mode,
});

const toCategoryDetail = (
  row: CategoryDetailQueryRow
): CategoryDetail => ({
  ...toCategoryListRow(row),
  alertExpiryDays: row.alert_expiry_days,
  alertMinQuantity: row.alert_min_quantity,
  canBeDamaged: row.can_be_damaged,
  consumesFuel: row.consumes_fuel,
  defaultDurationMinutes: row.default_duration_minutes,
  depositCrc: row.deposit_crc,
  depositUsd: row.deposit_usd,
  guideOnly: row.guide_only,
  hasConditionPhotos: row.has_condition_photos,
  hasMotor: row.has_motor,
  usageMetric: row.usage_metric,
});

/**
 * US-ADM-012: every category the company owns, reservable or not, with
 * search plus the two filters that matter for the master table (tracking
 * mode, status) — one page at a time (US-TAB-008).
 */
export const fetchCategoriesPage = async (
  supabase: SupabaseClient<Database>,
  filters: CategoriesFilters,
  page: number,
  pageSize: number
): Promise<CategoriesPage> => {
  let query = supabase
    .from("equipment_categories")
    .select(CATEGORY_LIST_SELECT, { count: "exact" })
    .order("name");

  if (filters.trackingMode) {
    query = query.eq("tracking_mode", filters.trackingMode);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.ilike(
      "name",
      `%${filters.search.trim()}%`
    );
  }

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query.range(
    from,
    from + pageSize - 1
  );
  throwIfSupabaseError(
    error,
    "categories.fetchCategoriesPage"
  );

  return {
    rows: (
      (data ?? []) as unknown as CategoryListQueryRow[]
    ).map(toCategoryListRow),
    totalCount: count ?? 0,
  };
};

/**
 * The full behavior of one category (US-ADM-013 through US-ADM-015), for
 * the edit screen.
 */
export const fetchCategoryDetail = async (
  supabase: SupabaseClient<Database>,
  categoryId: string
): Promise<Nullable<CategoryDetail>> => {
  const { data, error } = await supabase
    .from("equipment_categories")
    .select(CATEGORY_DETAIL_SELECT)
    .eq("id", categoryId)
    .maybeSingle();
  throwIfSupabaseError(
    error,
    "categories.fetchCategoryDetail"
  );

  return data
    ? toCategoryDetail(
        data as unknown as CategoryDetailQueryRow
      )
    : null;
};

/**
 * US-ADM-012/US-ADM-015 (validaciones): whether a category already has
 * units or stock — the same question `categories_freeze_tracking_mode`
 * asks in the database, mirrored here so the edit screen can decide
 * between offering "eliminar" and "marcar inactiva" without a failed
 * request round trip.
 */
export const categoryHasRecords = async (
  supabase: SupabaseClient<Database>,
  categoryId: string
): Promise<boolean> => {
  const [unitsResult, stockResult] = await Promise.all([
    supabase
      .from("equipment_units")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId),
    supabase
      .from("equipment_stock")
      .select("category_id", { count: "exact", head: true })
      .eq("category_id", categoryId),
  ]);
  throwIfSupabaseError(
    unitsResult.error,
    "categories.categoryHasRecords.units"
  );
  throwIfSupabaseError(
    stockResult.error,
    "categories.categoryHasRecords.stock"
  );

  return (
    (unitsResult.count ?? 0) > 0 ||
    (stockResult.count ?? 0) > 0
  );
};
