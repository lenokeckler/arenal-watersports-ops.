import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import {
  deleteReservationItem,
  type ReservationEquipmentItem,
} from "@/app/utils/reservas/reservationEquipmentItems";

export interface InitialEquipmentSelection {
  initialQuantities: Record<string, number>;
  initialSelectedUnitIds: string[];
}

/**
 * US-RES-018/US-OPE-002: seeds an equipment picker from what a reservation
 * already commits — the edit modal and the dispatch sheet's equipment-
 * confirmation step both start from "what is already there" instead of
 * empty.
 */
export const buildInitialEquipmentSelection = (
  originalItems: ReservationEquipmentItem[]
): InitialEquipmentSelection => {
  const initialQuantities: Record<string, number> = {};
  const initialSelectedUnitIds: string[] = [];
  for (const item of originalItems) {
    if (item.unitId) {
      initialSelectedUnitIds.push(item.unitId);
    } else if (item.categoryId && item.quantity) {
      initialQuantities[item.categoryId] = item.quantity;
    }
  }
  return { initialQuantities, initialSelectedUnitIds };
};

const insertItems = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  rows: {
    categoryId: string | null;
    quantity: number | null;
    unitId: string | null;
  }[],
  workerId: string
): Promise<void> => {
  if (rows.length === 0) {
    return;
  }
  const { error } = await supabase
    .from("reservation_items")
    .insert(
      rows.map((row) => ({
        category_id: row.categoryId,
        created_by: workerId,
        quantity: row.quantity,
        reservation_id: reservationId,
        unit_id: row.unitId,
        updated_by: workerId,
      }))
    );
  throwIfSupabaseError(
    error,
    "reservas.updateReservationEquipment.insertItems"
  );
};

const applyUnitDiff = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  originalUnitItems: ReservationEquipmentItem[],
  finalUnitIds: string[],
  workerId: string
): Promise<void> => {
  const originalUnitIds = originalUnitItems.map(
    (item) => item.unitId
  );

  const toRemove = originalUnitItems.filter(
    (item) => !finalUnitIds.includes(item.unitId ?? "")
  );
  await Promise.all(
    toRemove.map((item) =>
      deleteReservationItem(reservationId, item.id)
    )
  );

  const toAdd = finalUnitIds.filter(
    (unitId) => !originalUnitIds.includes(unitId)
  );
  await insertItems(
    supabase,
    reservationId,
    toAdd.map((unitId) => ({
      categoryId: null,
      quantity: null,
      unitId,
    })),
    workerId
  );
};

const updateQuantity = async (
  supabase: SupabaseClient<Database>,
  itemId: string,
  quantity: number,
  workerId: string
): Promise<void> => {
  const { error } = await supabase
    .from("reservation_items")
    .update({ quantity, updated_by: workerId })
    .eq("id", itemId);
  throwIfSupabaseError(
    error,
    "reservas.updateReservationEquipment.updateQuantity"
  );
};

const applyQuantityDiff = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  originalQuantityItems: ReservationEquipmentItem[],
  finalQuantities: Record<string, number>,
  workerId: string
): Promise<void> => {
  const toRemove = originalQuantityItems.filter(
    (item) =>
      !item.categoryId ||
      finalQuantities[item.categoryId] === undefined
  );
  const toUpdate = originalQuantityItems.filter(
    (item) =>
      item.categoryId &&
      finalQuantities[item.categoryId] !== undefined &&
      finalQuantities[item.categoryId] !== item.quantity
  );

  await Promise.all([
    ...toRemove.map((item) =>
      deleteReservationItem(reservationId, item.id)
    ),
    ...toUpdate.map((item) =>
      updateQuantity(
        supabase,
        item.id,
        finalQuantities[item.categoryId as string],
        workerId
      )
    ),
  ]);

  const originalCategoryIds = originalQuantityItems.map(
    (item) => item.categoryId
  );
  const newCategoryIds = Object.keys(
    finalQuantities
  ).filter(
    (categoryId) =>
      !originalCategoryIds.includes(categoryId)
  );
  await insertItems(
    supabase,
    reservationId,
    newCategoryIds.map((categoryId) => ({
      categoryId,
      quantity: finalQuantities[categoryId],
      unitId: null,
    })),
    workerId
  );
};

/**
 * US-RES-018: reconciles the equipment a reservation commits with what the
 * edit modal ends up with — a unit-based line either stays, gets removed
 * (service-role `DELETE`, `reservation_items_delete` at the client is
 * revoked) or gets added; a quantity-based line's count changes in place,
 * matching how `createReservation` builds one row per category. Extra-
 * linked rows never reach here — `fetchReservationEquipmentItems` already
 * excludes them.
 */
export const applyReservationEquipmentEdit = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  originalItems: ReservationEquipmentItem[],
  finalQuantities: Record<string, number>,
  finalSelectedUnitIds: string[],
  workerId: string
): Promise<void> => {
  const originalUnitItems = originalItems.filter(
    (item) => item.unitId
  );
  const originalQuantityItems = originalItems.filter(
    (item) => !item.unitId
  );

  await applyUnitDiff(
    supabase,
    reservationId,
    originalUnitItems,
    finalSelectedUnitIds,
    workerId
  );
  await applyQuantityDiff(
    supabase,
    reservationId,
    originalQuantityItems,
    finalQuantities,
    workerId
  );
};
