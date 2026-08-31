import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import type { TrackingMode } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface InventorySummaryRow {
  categoryId: string;
  categoryName: string;
  isReservable: boolean;
  quantityAvailable: number;
  quantityDamaged: number;
  quantityInMaintenance: number;
  quantityInRepair: number;
  quantityTotal: number;
  trackingMode: TrackingMode;
}

interface InventorySummaryQueryRow {
  category_id: string;
  category_name: string;
  is_reservable: boolean;
  quantity_available: number;
  quantity_damaged: number;
  quantity_in_maintenance: number;
  quantity_in_repair: number;
  quantity_total: number;
  tracking_mode: TrackingMode;
}

const SUMMARY_SELECT =
  "category_id, category_name, tracking_mode, is_reservable, " +
  "quantity_available, quantity_damaged, quantity_in_repair, " +
  "quantity_in_maintenance, quantity_total";

/**
 * US-OPE-021: "el inventario cubre todo lo que la empresa tiene, incluidos
 * los jet skis y las lanchas". `inventory_category_summary` already
 * normalises both modalities to the same columns — a `by_unit` category
 * counts its fichas, a `by_quantity` one reads its stock row — so this
 * screen never branches on the modality just to know how many there are.
 */
export const fetchInventorySummary = async (
  supabase: SupabaseClient<Database>
): Promise<InventorySummaryRow[]> => {
  const { data, error } = await supabase
    .from("inventory_category_summary")
    .select(SUMMARY_SELECT)
    .order("category_name");
  throwIfSupabaseError(
    error,
    "operaciones.inventorySummary.fetchInventorySummary"
  );

  return (
    (data ?? []) as unknown as InventorySummaryQueryRow[]
  ).map((row) => ({
    categoryId: row.category_id,
    categoryName: row.category_name,
    isReservable: row.is_reservable,
    quantityAvailable: row.quantity_available,
    quantityDamaged: row.quantity_damaged,
    quantityInMaintenance: row.quantity_in_maintenance,
    quantityInRepair: row.quantity_in_repair,
    quantityTotal: row.quantity_total,
    trackingMode: row.tracking_mode,
  }));
};
