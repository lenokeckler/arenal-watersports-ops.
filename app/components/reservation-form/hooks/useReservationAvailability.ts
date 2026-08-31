"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { RESERVATION_NUMBERS } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { useDebouncedValue } from "@/app/utils/hooks/useDebouncedValue";
import { useEquipmentRealtimeRefresh } from "@/app/utils/tablero/useEquipmentRealtimeRefresh";
import {
  fetchCategoryAvailability,
  fetchUnitConflicts,
  type CategoryAvailability,
  type UnitConflict,
} from "@/app/utils/reservas/availabilityQueries";

const REALTIME_CHANNEL_NAME = "reserva-nueva";

interface AvailabilitySnapshot {
  categoryAvailability: Record<
    string,
    CategoryAvailability
  >;
  unitConflicts: Record<string, UnitConflict[]>;
}

const EMPTY_AVAILABILITY_SNAPSHOT: AvailabilitySnapshot = {
  categoryAvailability: {},
  unitConflicts: {},
};

const loadAvailability = async (
  supabase: SupabaseClient<Database>,
  quantityCategoryIds: string[],
  selectedUnitIds: string[],
  startsAt: string,
  endsAt: string
): Promise<AvailabilitySnapshot> => {
  const [categoryEntries, unitEntries] = await Promise.all([
    Promise.all(
      quantityCategoryIds.map(async (categoryId) => {
        const availability =
          await fetchCategoryAvailability(
            supabase,
            categoryId,
            startsAt,
            endsAt
          );
        return [categoryId, availability] as const;
      })
    ),
    Promise.all(
      selectedUnitIds.map(async (unitId) => {
        const conflicts = await fetchUnitConflicts(
          supabase,
          unitId,
          startsAt,
          endsAt
        );
        return [unitId, conflicts] as const;
      })
    ),
  ]);

  return {
    categoryAvailability:
      Object.fromEntries(categoryEntries),
    unitConflicts: Object.fromEntries(unitEntries),
  };
};

export interface UseReservationAvailabilityReturn extends AvailabilitySnapshot {
  isChecking: boolean;
}

/**
 * US-RES-015/US-RES-016: recomputes availability and conflicts for the
 * current franja — debounced, since the franja changes on every keystroke
 * of date/time/duration — and again whenever another dispatch touches the
 * watched tables, via the same realtime refresh the board uses.
 */
export const useReservationAvailability = (
  startsAtIso: string,
  endsAtIso: string,
  quantityCategoryIds: string[],
  selectedUnitIds: string[]
): UseReservationAvailabilityReturn => {
  const [snapshot, setSnapshot] =
    useState<AvailabilitySnapshot>(
      EMPTY_AVAILABILITY_SNAPSHOT
    );
  const [isChecking, setIsChecking] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const debouncedStartsAt = useDebouncedValue(
    startsAtIso,
    RESERVATION_NUMBERS.AVAILABILITY_DEBOUNCE_MS
  );
  const debouncedEndsAt = useDebouncedValue(
    endsAtIso,
    RESERVATION_NUMBERS.AVAILABILITY_DEBOUNCE_MS
  );

  useEquipmentRealtimeRefresh(
    () => setRefreshToken((token) => token + 1),
    REALTIME_CHANNEL_NAME
  );

  const hasValidFranja = Boolean(
    debouncedStartsAt && debouncedEndsAt
  );

  useEffect(() => {
    if (!hasValidFranja) {
      return undefined;
    }

    let isCancelled = false;
    const supabase = createBrowserSupabaseClient();

    // `setIsChecking(true)` runs inside this resolved-promise callback,
    // not as the effect's first synchronous statement, so it does not
    // trigger the cascading-render the direct call would.
    void Promise.resolve().then(() => {
      if (!isCancelled) {
        setIsChecking(true);
      }
    });

    void loadAvailability(
      supabase,
      quantityCategoryIds,
      selectedUnitIds,
      debouncedStartsAt,
      debouncedEndsAt
    ).then((result) => {
      if (isCancelled) {
        return;
      }
      setSnapshot(result);
      setIsChecking(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [
    debouncedStartsAt,
    debouncedEndsAt,
    hasValidFranja,
    quantityCategoryIds,
    selectedUnitIds,
    refreshToken,
  ]);

  return {
    ...(hasValidFranja
      ? snapshot
      : EMPTY_AVAILABILITY_SNAPSHOT),
    isChecking,
  };
};
