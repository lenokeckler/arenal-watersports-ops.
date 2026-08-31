"use client";

import { useState } from "react";

export interface UseReservationExtrasSelectionReturn {
  handleToggleExtra: (
    unitId: string,
    extraId: string
  ) => void;
  selectedExtraIdsByUnit: Record<string, string[]>;
}

/**
 * US-RES-011: which extras go with which selected unit — a lancha's
 * parrilla is not the same commitment as a jet ski's, so this is keyed by
 * unit, mirroring `extra_compatibility` itself.
 */
export const useReservationExtrasSelection =
  (): UseReservationExtrasSelectionReturn => {
    const [
      selectedExtraIdsByUnit,
      setSelectedExtraIdsByUnit,
    ] = useState<Record<string, string[]>>({});

    const handleToggleExtra = (
      unitId: string,
      extraId: string
    ): void => {
      setSelectedExtraIdsByUnit((current) => {
        const selected = current[unitId] ?? [];
        const nextSelected = selected.includes(extraId)
          ? selected.filter((id) => id !== extraId)
          : [...selected, extraId];
        return { ...current, [unitId]: nextSelected };
      });
    };

    return { handleToggleExtra, selectedExtraIdsByUnit };
  };
