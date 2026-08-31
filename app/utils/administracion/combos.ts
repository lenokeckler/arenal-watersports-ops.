import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  CATEGORY_STATUS,
  type CategoryStatus,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface CombosFilters {
  search: Nullable<string>;
  status: Nullable<CategoryStatus>;
}

export interface ComboListRow {
  id: string;
  name: string;
  packagePriceCrc: Nullable<number>;
  packagePriceUsd: Nullable<number>;
  status: CategoryStatus;
}

export interface ComboItemRow {
  categoryId: string;
  categoryName: string;
  quantity: number;
}

export interface CombosPage {
  rows: ComboListRow[];
  totalCount: number;
}

export interface ComboDetail extends ComboListRow {
  items: ComboItemRow[];
}

/** Any active category — a combo item can be `by_unit` or `by_quantity`. */
export interface ComboCategoryOption {
  id: string;
  name: string;
}

const COMBO_LIST_SELECT =
  "id, name, status, package_price_usd, package_price_crc";

interface ComboListQueryRow {
  id: string;
  name: string;
  package_price_crc: Nullable<number>;
  package_price_usd: Nullable<number>;
  status: CategoryStatus;
}

interface ComboItemQueryRow {
  category_id: string;
  equipment_categories: { name: string } | null;
  quantity: number;
}

const toComboListRow = (
  row: ComboListQueryRow
): ComboListRow => ({
  id: row.id,
  name: row.name,
  packagePriceCrc: row.package_price_crc,
  packagePriceUsd: row.package_price_usd,
  status: row.status,
});

/** US-ADM-022: the combos catalog, filtered and paginated like `CategoryList`. */
export const fetchCombosPage = async (
  supabase: SupabaseClient<Database>,
  filters: CombosFilters,
  page: number,
  pageSize: number
): Promise<CombosPage> => {
  let query = supabase
    .from("combos")
    .select(COMBO_LIST_SELECT, { count: "exact" })
    .order("name");

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
  throwIfSupabaseError(error, "combos.fetchCombosPage");

  return {
    rows: (
      (data ?? []) as unknown as ComboListQueryRow[]
    ).map(toComboListRow),
    totalCount: count ?? 0,
  };
};

/** The full behavior of one combo (US-ADM-022, US-ADM-023), for the edit screen. */
export const fetchComboDetail = async (
  supabase: SupabaseClient<Database>,
  comboId: string
): Promise<Nullable<ComboDetail>> => {
  const [comboResult, itemsResult] = await Promise.all([
    supabase
      .from("combos")
      .select(COMBO_LIST_SELECT)
      .eq("id", comboId)
      .maybeSingle(),
    supabase
      .from("combo_items")
      .select(
        "category_id, quantity, equipment_categories(name)"
      )
      .eq("combo_id", comboId),
  ]);
  throwIfSupabaseError(
    comboResult.error,
    "combos.fetchComboDetail.combo"
  );
  throwIfSupabaseError(
    itemsResult.error,
    "combos.fetchComboDetail.items"
  );

  if (!comboResult.data) {
    return null;
  }

  const items: ComboItemRow[] = (
    (itemsResult.data ??
      []) as unknown as ComboItemQueryRow[]
  ).map((row) => ({
    categoryId: row.category_id,
    categoryName: row.equipment_categories?.name ?? "",
    quantity: row.quantity,
  }));

  return {
    ...toComboListRow(
      comboResult.data as unknown as ComboListQueryRow
    ),
    items,
  };
};

/**
 * US-ADM-022 (criterio de aceptación): whether a combo was ever sold —
 * a reservation of type `combo` pointing at it — the same
 * "eliminar vs. marcar inactivo" question `categoryHasRecords` answers.
 */
export const comboHasRecords = async (
  supabase: SupabaseClient<Database>,
  comboId: string
): Promise<boolean> => {
  const { count, error } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("combo_id", comboId);
  throwIfSupabaseError(error, "combos.comboHasRecords");

  return (count ?? 0) > 0;
};

/**
 * US-ADM-022: every active category a combo item can reference — `by_unit`
 * or `by_quantity` alike, since a combo just states "N of this category"
 * and reservas assigns the specific units later.
 */
export const fetchComboCategoryOptions = async (
  supabase: SupabaseClient<Database>
): Promise<ComboCategoryOption[]> => {
  const { data, error } = await supabase
    .from("equipment_categories")
    .select("id, name")
    .eq("status", CATEGORY_STATUS.ACTIVE)
    .order("name");
  throwIfSupabaseError(
    error,
    "combos.fetchComboCategoryOptions"
  );

  return data ?? [];
};
