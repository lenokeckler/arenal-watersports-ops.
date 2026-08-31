"use client";

import { useMemo, useState } from "react";
import {
  COMBO_MODE,
  TRACKING_MODE,
  type ComboMode,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { ReservableCombo } from "@/app/utils/reservas/newReservationData";

const NO_SELECTIONS = 0;

export interface UseReservationComboSelectionReturn {
  comboUnitSelections: Record<string, string[]>;
  handleSelectCombo: (comboId: string) => void;
  handleToggleComboUnit: (
    categoryId: string,
    unitId: string,
    requiredQuantity: number
  ) => void;
  isPredefinedSelectionComplete: boolean;
  mode: ComboMode;
  selectedCombo: Nullable<ReservableCombo>;
  setMode: (mode: ComboMode) => void;
}

/**
 * US-RES-009/US-RES-010: how a `combo` reservation gets assembled — a
 * predefined combo (pick from the list, then fill in a concrete unit for
 * every `by_unit` slot it requires) or a combo a la medida, which delegates
 * back to `useReservationEquipmentSelection`, the exact same free-form
 * picker `rental`/`tour` already use.
 */
export const useReservationComboSelection = (
  combos: ReservableCombo[]
): UseReservationComboSelectionReturn => {
  const [mode, setModeState] = useState<ComboMode>(
    COMBO_MODE.PREDEFINED
  );
  const [selectedComboId, setSelectedComboId] =
    useState<Nullable<string>>(null);
  const [comboUnitSelections, setComboUnitSelections] =
    useState<Record<string, string[]>>({});

  const selectedCombo = useMemo(
    () =>
      combos.find(
        (combo) => combo.id === selectedComboId
      ) ?? null,
    [combos, selectedComboId]
  );

  const setMode = (nextMode: ComboMode): void => {
    setModeState(nextMode);
    setSelectedComboId(null);
    setComboUnitSelections({});
  };

  const handleSelectCombo = (comboId: string): void => {
    setSelectedComboId(comboId);
    setComboUnitSelections({});
  };

  const handleToggleComboUnit = (
    categoryId: string,
    unitId: string,
    requiredQuantity: number
  ): void => {
    setComboUnitSelections((current) => {
      const selected = current[categoryId] ?? [];
      if (selected.includes(unitId)) {
        return {
          ...current,
          [categoryId]: selected.filter(
            (selectedId) => selectedId !== unitId
          ),
        };
      }
      if (selected.length >= requiredQuantity) {
        return current;
      }
      return {
        ...current,
        [categoryId]: [...selected, unitId],
      };
    });
  };

  const isPredefinedSelectionComplete = Boolean(
    selectedCombo &&
    selectedCombo.items.every(
      (item) =>
        item.trackingMode !== TRACKING_MODE.BY_UNIT ||
        (comboUnitSelections[item.categoryId]?.length ??
          NO_SELECTIONS) === item.quantity
    )
  );

  return {
    comboUnitSelections,
    handleSelectCombo,
    handleToggleComboUnit,
    isPredefinedSelectionComplete,
    mode,
    selectedCombo,
    setMode,
  };
};
