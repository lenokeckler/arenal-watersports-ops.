"use client";

import { useState } from "react";

export interface UseReservationGuidesSelectionReturn {
  handleToggleGuide: (workerId: string) => void;
  selectedGuideIds: string[];
}

/**
 * US-RES-012: which guides go on this tour — no maximum, a big group can
 * take two guides, so this is a plain multi-select, not a single value.
 */
export const useReservationGuidesSelection =
  (): UseReservationGuidesSelectionReturn => {
    const [selectedGuideIds, setSelectedGuideIds] =
      useState<string[]>([]);

    const handleToggleGuide = (workerId: string): void => {
      setSelectedGuideIds((current) =>
        current.includes(workerId)
          ? current.filter((id) => id !== workerId)
          : [...current, workerId]
      );
    };

    return { handleToggleGuide, selectedGuideIds };
  };
