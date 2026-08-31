"use client";

import { useState } from "react";

const NO_QUANTITY = 0;
const NO_SELECTIONS = 0;

export interface UseReservationEquipmentSelectionReturn {
  handleQuantityChange: (
    categoryId: string,
    quantity: number
  ) => void;
  handleToggleUnit: (unitId: string) => void;
  hasAnySelection: boolean;
  quantities: Record<string, number>;
  selectedUnitIds: string[];
}

/** US-RES-007: which categories (by quantity) and which units this reservation commits. */
export const useReservationEquipmentSelection =
  (): UseReservationEquipmentSelectionReturn => {
    const [quantities, setQuantities] = useState<
      Record<string, number>
    >({});
    const [selectedUnitIds, setSelectedUnitIds] = useState<
      string[]
    >([]);

    const handleQuantityChange = (
      categoryId: string,
      quantity: number
    ): void => {
      setQuantities((current) => {
        if (quantity <= NO_QUANTITY) {
          return Object.fromEntries(
            Object.entries(current).filter(
              ([id]) => id !== categoryId
            )
          );
        }
        return { ...current, [categoryId]: quantity };
      });
    };

    const handleToggleUnit = (unitId: string): void => {
      setSelectedUnitIds((current) =>
        current.includes(unitId)
          ? current.filter(
              (selectedId) => selectedId !== unitId
            )
          : [...current, unitId]
      );
    };

    const hasAnySelection =
      Object.keys(quantities).length > NO_SELECTIONS ||
      selectedUnitIds.length > NO_SELECTIONS;

    return {
      handleQuantityChange,
      handleToggleUnit,
      hasAnySelection,
      quantities,
      selectedUnitIds,
    };
  };
