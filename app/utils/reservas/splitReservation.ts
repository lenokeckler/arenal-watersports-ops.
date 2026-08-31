import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import type { ReservationType } from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";

export interface SplitQuantityMove {
  categoryId: string;
  itemId: string;
  movingQuantity: number;
  originalQuantity: number;
}

export interface SplitReservationParams {
  customerName: string;
  durationMinutes: number;
  newPeopleCount: number;
  parentReservationId: string;
  quantityMoves: SplitQuantityMove[];
  remainingPeopleCount: number;
  startsAt: string;
  type: ReservationType;
  unitItemIdsToMove: string[];
}

const insertChildReservation = async (
  supabase: SupabaseClient<Database>,
  params: SplitReservationParams,
  workerId: string
): Promise<string> => {
  // US-RES-019: the child never carries list/agreed amounts — the database
  // itself refuses it (`reservations_split_child_no_charge`), this just
  // never tries to set them.
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      created_by: workerId,
      customer_name: params.customerName,
      duration_minutes: params.durationMinutes,
      parent_reservation_id: params.parentReservationId,
      people_count: params.newPeopleCount,
      starts_at: params.startsAt,
      type: params.type,
      updated_by: workerId,
    })
    .select("id")
    .single();
  throwIfSupabaseError(
    error,
    "reservas.splitReservation.insertChildReservation"
  );

  if (!data) {
    throw new Error(
      "reservas.splitReservation: child insert returned no row"
    );
  }
  return data.id;
};

const moveUnitItems = async (
  supabase: SupabaseClient<Database>,
  itemIds: string[],
  childId: string,
  workerId: string
): Promise<void> => {
  if (itemIds.length === 0) {
    return;
  }
  const { error } = await supabase
    .from("reservation_items")
    .update({
      reservation_id: childId,
      updated_by: workerId,
    })
    .in("id", itemIds);
  throwIfSupabaseError(
    error,
    "reservas.splitReservation.moveUnitItems"
  );
};

const applyQuantityMoves = async (
  supabase: SupabaseClient<Database>,
  moves: SplitQuantityMove[],
  childId: string,
  workerId: string
): Promise<void> => {
  const fullMoves = moves.filter(
    (move) => move.movingQuantity === move.originalQuantity
  );
  const partialMoves = moves.filter(
    (move) =>
      move.movingQuantity > 0 &&
      move.movingQuantity < move.originalQuantity
  );

  const fullMoveIds = fullMoves.map((move) => move.itemId);
  if (fullMoveIds.length > 0) {
    const { error } = await supabase
      .from("reservation_items")
      .update({
        reservation_id: childId,
        updated_by: workerId,
      })
      .in("id", fullMoveIds);
    throwIfSupabaseError(
      error,
      "reservas.splitReservation.applyQuantityMoves.full"
    );
  }

  await Promise.all(
    partialMoves.map(async (move) => {
      const { error: shrinkError } = await supabase
        .from("reservation_items")
        .update({
          quantity:
            move.originalQuantity - move.movingQuantity,
          updated_by: workerId,
        })
        .eq("id", move.itemId);
      throwIfSupabaseError(
        shrinkError,
        "reservas.splitReservation.applyQuantityMoves.shrink"
      );

      const { error: insertError } = await supabase
        .from("reservation_items")
        .insert({
          category_id: move.categoryId,
          created_by: workerId,
          quantity: move.movingQuantity,
          reservation_id: childId,
          updated_by: workerId,
        });
      throwIfSupabaseError(
        insertError,
        "reservas.splitReservation.applyQuantityMoves.insert"
      );
    })
  );
};

/**
 * US-RES-019: partir una reserva into two salidas. The charge never
 * splits — the child simply never receives `list_amount_*`/
 * `agreed_amount_*`, and the database enforces that itself — and the
 * deposit stays with the parent because `deposits` references the parent
 * reservation only, untouched here. Guides are not split: they stay
 * assigned to the parent, since the story's own acceptance criteria only
 * ever mention equipment and people count.
 */
export const splitReservation = async (
  supabase: SupabaseClient<Database>,
  params: SplitReservationParams,
  workerId: string
): Promise<{ childId: string }> => {
  const childId = await insertChildReservation(
    supabase,
    params,
    workerId
  );

  const { error: parentError } = await supabase
    .from("reservations")
    .update({
      people_count: params.remainingPeopleCount,
      updated_by: workerId,
    })
    .eq("id", params.parentReservationId);
  throwIfSupabaseError(
    parentError,
    "reservas.splitReservation.updateParentPeopleCount"
  );

  await moveUnitItems(
    supabase,
    params.unitItemIdsToMove,
    childId,
    workerId
  );
  await applyQuantityMoves(
    supabase,
    params.quantityMoves,
    childId,
    workerId
  );

  return { childId };
};
