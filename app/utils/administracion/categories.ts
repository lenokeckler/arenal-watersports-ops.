import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type {
  CategoryStatus,
  TrackingMode,
  UsageMetric,
} from "@/app/constants";

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

const CATEGORY_LIST_SELECT = "id, name, status, tracking_mode, is_reservable";

const CATEGORY_DETAIL_SELECT =
  "id, name, status, tracking_mode, is_reservable, has_motor, " +
  "usage_metric, consumes_fuel, can_be_damaged, has_condition_photos, " +
  "guide_only, default_duration_minutes, deposit_usd, deposit_crc, " +
  "alert_min_quantity, alert_expiry_days";

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
    query = query.ilike("name", `%${filters.search.trim()}%`);
  }

  const from = (page - 1) * pageSize;
  const { data, count } = await query.range(from, from + pageSize - 1);

  return {
    rows: (data ?? []) as CategoryListRow[],
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
  const { data } = await supabase
    .from("equipment_categories")
    .select(CATEGORY_DETAIL_SELECT)
    .eq("id", categoryId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    alertExpiryDays: data.alert_expiry_days,
    alertMinQuantity: data.alert_min_quantity,
    canBeDamaged: data.can_be_damaged,
    consumesFuel: data.consumes_fuel,
    defaultDurationMinutes: data.default_duration_minutes,
    depositCrc: data.deposit_crc,
    depositUsd: data.deposit_usd,
    guideOnly: data.guide_only,
    hasConditionPhotos: data.has_condition_photos,
    hasMotor: data.has_motor,
    id: data.id,
    isReservable: data.is_reservable,
    name: data.name,
    status: data.status,
    trackingMode: data.tracking_mode,
    usageMetric: data.usage_metric,
  };
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

  return (unitsResult.count ?? 0) > 0 || (stockResult.count ?? 0) > 0;
};
