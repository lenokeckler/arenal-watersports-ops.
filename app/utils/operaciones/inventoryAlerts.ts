import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface QuantityAlertRow {
  alertMinQuantity: number;
  categoryId: string;
  categoryName: string;
  missingQuantity: number;
  quantityAvailable: number;
}

export interface ExpiryAlertRow {
  categoryId: string;
  categoryName: string;
  daysToExpiry: number;
  expiryDate: string;
  isExpired: boolean;
}

export interface InventoryAlerts {
  expiry: ExpiryAlertRow[];
  quantity: QuantityAlertRow[];
}

interface QuantityAlertQueryRow {
  alert_min_quantity: number;
  category_id: string;
  category_name: string;
  missing_quantity: number;
  quantity_available: number;
}

interface ExpiryAlertQueryRow {
  category_id: string;
  category_name: string;
  days_to_expiry: number;
  expiry_date: string;
  is_expired: boolean;
}

const QUANTITY_SELECT =
  "category_id, category_name, alert_min_quantity, " +
  "quantity_available, missing_quantity";

const EXPIRY_SELECT =
  "category_id, category_name, expiry_date, days_to_expiry, is_expired";

/**
 * US-OPE-026 and US-OPE-027 read from two views that only ever return what
 * administración configured: a category without `alert_min_quantity` never
 * appears in the first, one without `alert_expiry_days` never appears in
 * the second, and the anticipation window is the category's own — nothing
 * here decides when something counts as low or near its date.
 */
export const fetchInventoryAlerts = async (
  supabase: SupabaseClient<Database>
): Promise<InventoryAlerts> => {
  const [quantityResult, expiryResult] = await Promise.all([
    supabase
      .from("inventory_quantity_alerts")
      .select(QUANTITY_SELECT)
      .order("missing_quantity", { ascending: false }),
    supabase
      .from("inventory_expiry_alerts")
      .select(EXPIRY_SELECT)
      .order("days_to_expiry"),
  ]);
  throwIfSupabaseError(
    quantityResult.error,
    "operaciones.inventoryAlerts.fetchInventoryAlerts.quantity"
  );
  throwIfSupabaseError(
    expiryResult.error,
    "operaciones.inventoryAlerts.fetchInventoryAlerts.expiry"
  );

  return {
    expiry: (
      (expiryResult.data ??
        []) as unknown as ExpiryAlertQueryRow[]
    ).map((row) => ({
      categoryId: row.category_id,
      categoryName: row.category_name,
      daysToExpiry: row.days_to_expiry,
      expiryDate: row.expiry_date,
      isExpired: row.is_expired,
    })),
    quantity: (
      (quantityResult.data ??
        []) as unknown as QuantityAlertQueryRow[]
    ).map((row) => ({
      alertMinQuantity: row.alert_min_quantity,
      categoryId: row.category_id,
      categoryName: row.category_name,
      missingQuantity: row.missing_quantity,
      quantityAvailable: row.quantity_available,
    })),
  };
};
