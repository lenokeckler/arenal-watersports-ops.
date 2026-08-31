"use client";

import { useEffect, useState } from "react";
import {
  RESERVATION_DETAIL_SCREEN,
  RESERVATION_NUMBERS,
  type ReservationType,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { fetchReservationEquipmentItems } from "@/app/utils/reservas/reservationEquipmentItems";
import {
  splitReservation,
  type SplitQuantityMove,
} from "@/app/utils/reservas/splitReservation";

export interface SplitItemState {
  categoryId: Nullable<string>;
  itemId: string;
  label: string;
  maxQuantity: number;
  movingQuantity: number;
  unitId: Nullable<string>;
}

interface SplitParentReservation {
  customerName: string;
  durationMinutes: number;
  id: string;
  peopleCount: number;
  startsAt: string;
  type: ReservationType;
}

interface UseReservationSplitModalViewModelParams {
  onSplit: () => void;
  reservation: SplitParentReservation;
  workerId: string;
}

export interface UseReservationSplitModalViewModelReturn {
  error: Nullable<string>;
  handleMovingQuantityChange: (
    itemId: string,
    movingQuantity: number
  ) => void;
  handleNewPeopleCountChange: (value: string) => void;
  handleSubmit: () => void;
  isBusy: boolean;
  isLoadingItems: boolean;
  items: SplitItemState[];
  newPeopleCount: string;
  remainingPeopleCount: number;
}

const labelForItem = (
  categoryName: Nullable<string>,
  unitCode: Nullable<string>,
  quantity: Nullable<number>
): string => {
  if (unitCode) {
    return categoryName
      ? `${categoryName} — ${unitCode}`
      : unitCode;
  }
  return `${categoryName ?? ""} x${quantity ?? 0}`;
};

/**
 * US-RES-019: how many people and which equipment move to a new salida
 * born from this one — the charge and deposit never enter this picture,
 * `splitReservation` never touches either.
 */
export const useReservationSplitModalViewModel = ({
  onSplit,
  reservation,
  workerId,
}: UseReservationSplitModalViewModelParams): UseReservationSplitModalViewModelReturn => {
  const [items, setItems] = useState<SplitItemState[]>([]);
  const [isLoadingItems, setIsLoadingItems] =
    useState(true);
  const [newPeopleCount, setNewPeopleCount] = useState("");
  const [error, setError] = useState<Nullable<string>>(
    null
  );
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    void fetchReservationEquipmentItems(
      supabase,
      reservation.id
    ).then((rawItems) => {
      setItems(
        rawItems.map((item) => ({
          categoryId: item.categoryId,
          itemId: item.id,
          label: labelForItem(
            item.categoryName,
            item.unitCode,
            item.quantity
          ),
          maxQuantity: item.unitId ? 1 : (item.quantity ?? 0),
          movingQuantity: 0,
          unitId: item.unitId,
        }))
      );
      setIsLoadingItems(false);
    });
    // Runs once per modal mount — a fresh reservation always remounts it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMovingQuantityChange = (
    itemId: string,
    movingQuantity: number
  ): void => {
    setItems((current) =>
      current.map((item) =>
        item.itemId === itemId
          ? { ...item, movingQuantity }
          : item
      )
    );
  };

  const remainingPeopleCount =
    reservation.peopleCount - Number(newPeopleCount || 0);

  const handleSubmit = (): void => {
    const parsedNewPeopleCount = Number(newPeopleCount);
    const isValidSplit =
      parsedNewPeopleCount >=
        RESERVATION_NUMBERS.MIN_SPLIT_PEOPLE_COUNT &&
      remainingPeopleCount >=
        RESERVATION_NUMBERS.MIN_SPLIT_PEOPLE_COUNT;

    if (!isValidSplit) {
      setError(
        RESERVATION_DETAIL_SCREEN.SPLIT.PEOPLE_REQUIRED
      );
      return;
    }

    setIsBusy(true);
    setError(null);

    const unitItemIdsToMove = items
      .filter(
        (item) => item.unitId && item.movingQuantity === 1
      )
      .map((item) => item.itemId);
    const quantityMoves: SplitQuantityMove[] = items
      .filter(
        (item) => !item.unitId && item.movingQuantity > 0
      )
      .map((item) => ({
        categoryId: item.categoryId as string,
        itemId: item.itemId,
        movingQuantity: item.movingQuantity,
        originalQuantity: item.maxQuantity,
      }));

    const supabase = createBrowserSupabaseClient();
    void splitReservation(
      supabase,
      {
        customerName: reservation.customerName,
        durationMinutes: reservation.durationMinutes,
        newPeopleCount: parsedNewPeopleCount,
        parentReservationId: reservation.id,
        quantityMoves,
        remainingPeopleCount,
        startsAt: reservation.startsAt,
        type: reservation.type,
        unitItemIdsToMove,
      },
      workerId
    )
      .then(onSplit)
      .catch(() => {
        setIsBusy(false);
        setError(RESERVATION_DETAIL_SCREEN.SPLIT.ERROR);
      });
  };

  return {
    error,
    handleMovingQuantityChange,
    handleNewPeopleCountChange: setNewPeopleCount,
    handleSubmit,
    isBusy,
    isLoadingItems,
    items,
    newPeopleCount,
    remainingPeopleCount,
  };
};
