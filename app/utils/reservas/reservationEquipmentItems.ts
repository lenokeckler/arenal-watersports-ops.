import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import { API, type UsageMetric } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface ReservationEquipmentItem {
  categoryId: Nullable<string>;
  categoryName: Nullable<string>;
  consumesFuel: boolean;
  /** Lecturas tomadas al despachar, para poder compararlas al cerrar. */
  fuelOut: Nullable<number>;
  hasMotor: boolean;
  id: string;
  quantity: Nullable<number>;
  unitCode: Nullable<string>;
  unitId: Nullable<string>;
  usageMetric: Nullable<UsageMetric>;
  usageOut: Nullable<number>;
}

interface EquipmentCategoryFlags {
  consumes_fuel: boolean;
  has_motor: boolean;
  id: string;
  name: string;
  usage_metric: Nullable<UsageMetric>;
}

interface ReservationItemRow {
  category: EquipmentCategoryFlags | null;
  fuel_out: Nullable<number>;
  id: string;
  quantity: Nullable<number>;
  usage_out: Nullable<number>;
  unit: {
    category: EquipmentCategoryFlags | null;
    code: string;
  } | null;
  unit_id: Nullable<string>;
}

/**
 * US-RES-018/US-RES-019/US-RES-020: the raw shape behind an equipment line
 * — unlike `fetchReservationDetail`'s flattened label, this keeps the
 * ids/flags the edit, split and postpone modals need to move, resize or
 * ask for a fuel/usage reading per item. A unit-based row's category comes
 * from the unit; a quantity-based row's category is its own `category_id`.
 * Extra-linked rows (`extra_id` set) are excluded on purpose: an extra's
 * occupied cupo is not equipment the modals let reservas move or resize.
 */
export const fetchReservationEquipmentItems = async (
  supabase: SupabaseClient<Database>,
  reservationId: string
): Promise<ReservationEquipmentItem[]> => {
  const { data, error } = await supabase
    .from("reservation_items")
    .select(
      `id, quantity, unit_id, fuel_out, usage_out,
       category:equipment_categories!reservation_items_category_id_fkey(
         id, name, has_motor, usage_metric, consumes_fuel
       ),
       unit:equipment_units(
         code,
         category:equipment_categories!equipment_units_category_id_fkey(
           id, name, has_motor, usage_metric, consumes_fuel
         )
       )`
    )
    .eq("reservation_id", reservationId)
    .is("extra_id", null);
  throwIfSupabaseError(
    error,
    "reservas.reservationEquipmentItems.fetchReservationEquipmentItems"
  );

  return (
    (data ?? []) as unknown as ReservationItemRow[]
  ).map((row) => {
    const category = row.unit?.category ?? row.category;
    return {
      categoryId: category?.id ?? null,
      categoryName: category?.name ?? null,
      consumesFuel: category?.consumes_fuel ?? false,
      fuelOut: row.fuel_out,
      hasMotor: category?.has_motor ?? false,
      id: row.id,
      quantity: row.quantity,
      unitCode: row.unit?.code ?? null,
      unitId: row.unit_id,
      usageMetric: category?.usage_metric ?? null,
      usageOut: row.usage_out,
    };
  });
};

/**
 * US-RES-018: removing a line from the equipment an existing reservation
 * commits. `DELETE` is revoked for `authenticated` at the database level
 * (`rls_identity_catalog.sql`), so this always goes through the service
 * role route — the same reason combo item removal does.
 */
export const deleteReservationItem = async (
  reservationId: string,
  itemId: string
): Promise<void> => {
  const response = await fetch(
    API.ROUTES.RESERVATION_ITEM(reservationId, itemId),
    { method: API.METHODS.DELETE }
  );

  if (!response.ok) {
    throw new Error(
      `reservas.reservationEquipmentItems.deleteReservationItem: ${response.status}`
    );
  }
};
