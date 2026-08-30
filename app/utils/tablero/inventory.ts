import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { TRACKING_MODE, type TrackingMode } from "@/app/constants";
import type { Nullable } from "@/app/types";

export interface InventoryFilters {
  search: Nullable<string>;
  trackingMode: Nullable<TrackingMode>;
}

export interface InventoryRow {
  available: number;
  damaged: number;
  id: string;
  inRepair: number;
  name: string;
  total: number;
  trackingMode: TrackingMode;
}

export interface InventoryPage {
  rows: InventoryRow[];
  totalCount: number;
}

const AVAILABLE_STATUS = "available";
const DAMAGED_STATUS = "damaged";
const IN_REPAIR_STATUS = "in_repair";
const DECOMMISSIONED_STATUS = "decommissioned";

/**
 * US-TAB-001 ("los chalecos, los remos y los extintores... viven en el
 * inventario"): every category, reservable or not, counted by its
 * *recorded* condition — a unit out on a reservation still counts as
 * `available` here, since this screen is for a physical count, not for
 * booking. Server-paginated (US-TAB-008).
 */
export const fetchInventoryPage = async (
  supabase: SupabaseClient<Database>,
  filters: InventoryFilters,
  page: number,
  pageSize: number
): Promise<InventoryPage> => {
  let query = supabase
    .from("equipment_categories")
    .select("id, name, tracking_mode", { count: "exact" })
    .eq("status", "active")
    .order("name");

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }
  if (filters.trackingMode) {
    query = query.eq("tracking_mode", filters.trackingMode);
  }

  const from = (page - 1) * pageSize;
  const { data: categories, count } = await query.range(
    from,
    from + pageSize - 1
  );

  if (!categories || categories.length === 0) {
    return { rows: [], totalCount: count ?? 0 };
  }

  const byUnitIds = categories
    .filter((category) => category.tracking_mode === TRACKING_MODE.BY_UNIT)
    .map((category) => category.id);
  const byQuantityIds = categories
    .filter(
      (category) => category.tracking_mode === TRACKING_MODE.BY_QUANTITY
    )
    .map((category) => category.id);

  const unitCounts = new Map<
    string,
    { available: number; damaged: number; inRepair: number; total: number }
  >();

  if (byUnitIds.length > 0) {
    const { data: units } = await supabase
      .from("equipment_units")
      .select("category_id, status")
      .in("category_id", byUnitIds);

    for (const unit of units ?? []) {
      if (unit.status === DECOMMISSIONED_STATUS) {
        continue;
      }
      const current = unitCounts.get(unit.category_id) ?? {
        available: 0,
        damaged: 0,
        inRepair: 0,
        total: 0,
      };
      current.total += 1;
      if (unit.status === AVAILABLE_STATUS) {
        current.available += 1;
      } else if (unit.status === DAMAGED_STATUS) {
        current.damaged += 1;
      } else if (unit.status === IN_REPAIR_STATUS) {
        current.inRepair += 1;
      }
      unitCounts.set(unit.category_id, current);
    }
  }

  const stockByCategory = new Map<
    string,
    { available: number; damaged: number; inRepair: number }
  >();

  if (byQuantityIds.length > 0) {
    const { data: stockRows } = await supabase
      .from("equipment_stock")
      .select(
        "category_id, quantity_available, quantity_damaged, quantity_in_repair"
      )
      .in("category_id", byQuantityIds);

    for (const stock of stockRows ?? []) {
      stockByCategory.set(stock.category_id, {
        available: stock.quantity_available,
        damaged: stock.quantity_damaged,
        inRepair: stock.quantity_in_repair,
      });
    }
  }

  const rows: InventoryRow[] = categories.map((category) => {
    if (category.tracking_mode === TRACKING_MODE.BY_UNIT) {
      const counts = unitCounts.get(category.id);
      return {
        available: counts?.available ?? 0,
        damaged: counts?.damaged ?? 0,
        id: category.id,
        inRepair: counts?.inRepair ?? 0,
        name: category.name,
        total: counts?.total ?? 0,
        trackingMode: category.tracking_mode,
      };
    }

    const stock = stockByCategory.get(category.id);
    const available = stock?.available ?? 0;
    const damaged = stock?.damaged ?? 0;
    const inRepair = stock?.inRepair ?? 0;

    return {
      available,
      damaged,
      id: category.id,
      inRepair,
      name: category.name,
      total: available + damaged + inRepair,
      trackingMode: category.tracking_mode,
    };
  });

  return { rows, totalCount: count ?? 0 };
};
