"use client";

import { useState } from "react";

export interface UseUnitDispatchSelectionReturn {
  clearSelection: () => void;
  handleToggleUnit: (unitId: string) => void;
  selectedUnitIds: string[];
}

/**
 * US-OPE-002 (tablero entry): which available units on this category the
 * operator tapped to dispatch together — two jet skis going out on the same
 * reservation get toggled on here, then handed to one dispatch sheet
 * instead of repeating the flow twice.
 */
export const useUnitDispatchSelection =
  (): UseUnitDispatchSelectionReturn => {
    const [selectedUnitIds, setSelectedUnitIds] = useState<
      string[]
    >([]);

    const handleToggleUnit = (unitId: string): void => {
      setSelectedUnitIds((current) =>
        current.includes(unitId)
          ? current.filter(
              (selectedId) => selectedId !== unitId
            )
          : [...current, unitId]
      );
    };

    const clearSelection = (): void =>
      setSelectedUnitIds([]);

    return {
      clearSelection,
      handleToggleUnit,
      selectedUnitIds,
    };
  };
