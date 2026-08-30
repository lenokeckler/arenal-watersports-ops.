import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import type { CategoryStatus } from "@/app/constants";
import {
  CATEGORY_STATUS,
  TRACKING_MODE,
  UNIT_STATUS,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface ExtrasFilters {
  search: Nullable<string>;
  status: Nullable<CategoryStatus>;
}

export interface ExtraListRow {
  id: string;
  name: string;
  occupiesCategoryId: Nullable<string>;
  occupiesQuantity: Nullable<number>;
  priceCrc: Nullable<number>;
  priceUsd: Nullable<number>;
  status: CategoryStatus;
}

export interface ExtrasPage {
  rows: ExtraListRow[];
  totalCount: number;
}

export interface ExtraDetail extends ExtraListRow {
  compatibleUnitIds: string[];
}

/** A `by_quantity` category an extra can occupy (US-ADM-021). */
export interface QuantityCategoryOption {
  id: string;
  name: string;
}

/** One active `by_unit` unit, grouped by its category for the picker. */
export interface CompatibilityUnitOption {
  categoryName: string;
  code: string;
  id: string;
}

const EXTRA_LIST_SELECT =
  "id, name, status, price_usd, price_crc, occupies_category_id, " +
  "occupies_quantity";

interface ExtraListQueryRow {
  id: string;
  name: string;
  occupies_category_id: Nullable<string>;
  occupies_quantity: Nullable<number>;
  price_crc: Nullable<number>;
  price_usd: Nullable<number>;
  status: CategoryStatus;
}

const toExtraListRow = (row: ExtraListQueryRow): ExtraListRow => ({
  id: row.id,
  name: row.name,
  occupiesCategoryId: row.occupies_category_id,
  occupiesQuantity: row.occupies_quantity,
  priceCrc: row.price_crc,
  priceUsd: row.price_usd,
  status: row.status,
});

/** US-ADM-019: the extras catalog, filtered and paginated like `CategoryList`. */
export const fetchExtrasPage = async (
  supabase: SupabaseClient<Database>,
  filters: ExtrasFilters,
  page: number,
  pageSize: number
): Promise<ExtrasPage> => {
  let query = supabase
    .from("extras")
    .select(EXTRA_LIST_SELECT, { count: "exact" })
    .order("name");

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.ilike("name", `%${filters.search.trim()}%`);
  }

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query.range(
    from,
    from + pageSize - 1
  );
  throwIfSupabaseError(error, "extras.fetchExtrasPage");

  return {
    rows: ((data ?? []) as unknown as ExtraListQueryRow[]).map(
      toExtraListRow
    ),
    totalCount: count ?? 0,
  };
};

/** The full behavior of one extra (US-ADM-020, US-ADM-021), for the edit screen. */
export const fetchExtraDetail = async (
  supabase: SupabaseClient<Database>,
  extraId: string
): Promise<Nullable<ExtraDetail>> => {
  const [extraResult, compatibilityResult] = await Promise.all([
    supabase
      .from("extras")
      .select(EXTRA_LIST_SELECT)
      .eq("id", extraId)
      .maybeSingle(),
    supabase
      .from("extra_compatibility")
      .select("unit_id")
      .eq("extra_id", extraId),
  ]);
  throwIfSupabaseError(
    extraResult.error,
    "extras.fetchExtraDetail.extra"
  );
  throwIfSupabaseError(
    compatibilityResult.error,
    "extras.fetchExtraDetail.compatibility"
  );

  if (!extraResult.data) {
    return null;
  }

  return {
    ...toExtraListRow(extraResult.data as unknown as ExtraListQueryRow),
    compatibleUnitIds: (compatibilityResult.data ?? []).map(
      (row) => row.unit_id
    ),
  };
};

/**
 * US-ADM-019 (criterio de aceptación): whether an extra was ever attached to
 * a reservation — the same "eliminar vs. marcar inactivo" question
 * `categoryHasRecords` answers for categories.
 */
export const extraHasRecords = async (
  supabase: SupabaseClient<Database>,
  extraId: string
): Promise<boolean> => {
  const { count, error } = await supabase
    .from("reservation_items")
    .select("id", { count: "exact", head: true })
    .eq("extra_id", extraId);
  throwIfSupabaseError(error, "extras.extraHasRecords");

  return (count ?? 0) > 0;
};

/**
 * US-ADM-021: only a `by_quantity` category has an aggregate count an extra
 * can occupy — a `by_unit` category has fichas, not a quantity to consume.
 */
export const fetchQuantityCategoryOptions = async (
  supabase: SupabaseClient<Database>
): Promise<QuantityCategoryOption[]> => {
  const { data, error } = await supabase
    .from("equipment_categories")
    .select("id, name")
    .eq("tracking_mode", TRACKING_MODE.BY_QUANTITY)
    .eq("status", CATEGORY_STATUS.ACTIVE)
    .order("name");
  throwIfSupabaseError(
    error,
    "extras.fetchQuantityCategoryOptions"
  );

  return data ?? [];
};

interface CompatibilityUnitQueryRow {
  code: string;
  equipment_categories: { name: string } | null;
  id: string;
}

/**
 * US-ADM-020: every active unit, grouped by category, for the
 * "embarcaciones donde aplica" checklist — compatibility is per unit, not
 * per category, because two boats do not admit the same extras.
 */
export const fetchCompatibilityUnitOptions = async (
  supabase: SupabaseClient<Database>
): Promise<CompatibilityUnitOption[]> => {
  const { data, error } = await supabase
    .from("equipment_units")
    .select("id, code, equipment_categories(name)")
    .neq("status", UNIT_STATUS.DECOMMISSIONED)
    .order("code");
  throwIfSupabaseError(
    error,
    "extras.fetchCompatibilityUnitOptions"
  );

  return ((data ?? []) as unknown as CompatibilityUnitQueryRow[]).map(
    (row) => ({
      categoryName: row.equipment_categories?.name ?? "",
      code: row.code,
      id: row.id,
    })
  );
};
