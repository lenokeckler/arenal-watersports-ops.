"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  INVENTORY_COUNT_SCREEN,
  PATHS,
  STRING,
  type UnitStatus,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { createInventoryCount } from "@/app/utils/operaciones/createInventoryCount";
import {
  buildCountLines,
  buildInitialCountState,
  countConfirmedCategories,
  type CountSheetState,
} from "@/app/utils/operaciones/countSheetState";
import type { InventoryCountFormProps } from "../models/InventoryCountFormProps.interface";
import type { InventoryCountViewModel } from "../models/InventoryCountViewModel.interface";

const NO_LINES = 0;

/**
 * US-OPE-023: the count is taken when operaciones decides to, category by
 * category, and closes with whatever was actually walked. Nothing here
 * writes back to `equipment_stock` — the count records what was found;
 * changing what the system holds is US-OPE-022/US-OPE-025 and leaves its
 * own signed movement.
 */
export const useInventoryCountViewModel = ({
  categories,
  workerId,
}: InventoryCountFormProps): InventoryCountViewModel => {
  const router = useRouter();
  const [state, setState] = useState<CountSheetState>(() =>
    buildInitialCountState(categories)
  );
  const [notes, setNotes] = useState<string>(STRING.Empty);
  const [error, setError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const patchCategory = (
    categoryId: string,
    patch: Partial<CountSheetState[string]>
  ): void => {
    setState((current) => ({
      ...current,
      [categoryId]: { ...current[categoryId], ...patch },
    }));
  };

  const handleUnitStatusChange = (
    categoryId: string,
    unitId: string,
    status: UnitStatus
  ): void => {
    patchCategory(categoryId, {
      unitStatuses: {
        ...state[categoryId].unitStatuses,
        [unitId]: status,
      },
    });
  };

  const handleSubmit = (): void => {
    const lines = buildCountLines(categories, state);

    if (lines.length === NO_LINES) {
      setError(INVENTORY_COUNT_SCREEN.NEW.ERROR.NO_LINES);
      return;
    }

    setIsBusy(true);
    setError(null);

    void createInventoryCount(
      createBrowserSupabaseClient(),
      { lines, notes: notes.trim() || null, workerId }
    )
      .then((countId) =>
        router.push(PATHS.OPERATIONS.COUNT_DETAIL(countId))
      )
      .catch(() => {
        setIsBusy(false);
        setError(INVENTORY_COUNT_SCREEN.NEW.ERROR.GENERIC);
      });
  };

  return {
    confirmedCount: countConfirmedCategories(state),
    error,
    handleNotesChange: setNotes,
    handleQuantityChange: (categoryId, field, value) =>
      patchCategory(categoryId, { [field]: value }),
    handleSubmit,
    handleToggleConfirmed: (categoryId) =>
      patchCategory(categoryId, {
        isConfirmed: !state[categoryId].isConfirmed,
      }),
    handleUnitStatusChange,
    isBusy,
    notes,
    state,
  };
};
