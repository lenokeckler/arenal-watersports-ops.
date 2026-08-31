import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface StockDetail {
  categoryId: string;
  expiryDate: Nullable<string>;
  quantityAvailable: number;
  quantityDamaged: number;
  quantityInRepair: number;
}

export interface StockMovementRow {
  createdAt: string;
  fromAvailable: number;
  fromDamaged: number;
  fromInRepair: number;
  id: string;
  reason: string;
  toAvailable: number;
  toDamaged: number;
  toInRepair: number;
}

interface StockQueryRow {
  category_id: string;
  expiry_date: Nullable<string>;
  quantity_available: number;
  quantity_damaged: number;
  quantity_in_repair: number;
}

interface StockMovementQueryRow {
  created_at: string;
  from_available: number;
  from_damaged: number;
  from_in_repair: number;
  id: string;
  reason: string;
  to_available: number;
  to_damaged: number;
  to_in_repair: number;
}

const toStockDetail = (
  row: StockQueryRow
): StockDetail => ({
  categoryId: row.category_id,
  expiryDate: row.expiry_date,
  quantityAvailable: row.quantity_available,
  quantityDamaged: row.quantity_damaged,
  quantityInRepair: row.quantity_in_repair,
});

const toStockMovementRow = (
  row: StockMovementQueryRow
): StockMovementRow => ({
  createdAt: row.created_at,
  fromAvailable: row.from_available,
  fromDamaged: row.from_damaged,
  fromInRepair: row.from_in_repair,
  id: row.id,
  reason: row.reason,
  toAvailable: row.to_available,
  toDamaged: row.to_damaged,
  toInRepair: row.to_in_repair,
});

/**
 * US-ADM-017: the single existence row of a `by_quantity` category. `null`
 * only for a category created before its stock row was ever provisioned —
 * the edit screen falls back to an insert in that case.
 */
export const fetchStockDetail = async (
  supabase: SupabaseClient<Database>,
  categoryId: string
): Promise<Nullable<StockDetail>> => {
  const { data, error } = await supabase
    .from("equipment_stock")
    .select(
      "category_id, quantity_available, quantity_damaged, " +
        "quantity_in_repair, expiry_date"
    )
    .eq("category_id", categoryId)
    .maybeSingle();
  throwIfSupabaseError(error, "stock.fetchStockDetail");

  return data
    ? toStockDetail(data as unknown as StockQueryRow)
    : null;
};

/**
 * US-ADM-017: "el historial de conteos deja ver de cuánto a cuánto bajó y
 * en qué fecha" — there is no ficha to decommission for a `by_quantity`
 * category, so this movement log is the only trace a count ever changed.
 */
export const fetchStockMovements = async (
  supabase: SupabaseClient<Database>,
  categoryId: string
): Promise<StockMovementRow[]> => {
  const { data, error } = await supabase
    .from("equipment_stock_movements")
    .select(
      "id, from_available, to_available, from_damaged, to_damaged, " +
        "from_in_repair, to_in_repair, reason, created_at"
    )
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });
  throwIfSupabaseError(error, "stock.fetchStockMovements");

  return (
    (data ?? []) as unknown as StockMovementQueryRow[]
  ).map(toStockMovementRow);
};
