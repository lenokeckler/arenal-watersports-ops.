"use client";

import { useState } from "react";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { StockMovementRow } from "@/app/utils/administracion/stock";
import type { StockQuantities } from "@/app/utils/administracion/stockValidation";

interface UseStockMovementLogReturn {
  logMovement: (
    reason: string,
    previous: StockQuantities,
    next: StockQuantities
  ) => Promise<boolean>;
  movements: StockMovementRow[];
}

/**
 * Owns the movement history and the one write that grows it (US-ADM-017):
 * "el historial de conteos deja ver de cuánto a cuánto bajó y en qué
 * fecha" — split out of `useStockFormViewModel` so that hook stays under
 * the file's own size limit.
 */
export const useStockMovementLog = (
  categoryId: string,
  adminWorkerId: string,
  initialMovements: StockMovementRow[]
): UseStockMovementLogReturn => {
  const [movements, setMovements] = useState<
    StockMovementRow[]
  >(initialMovements);

  /**
   * Returns whether the movement was actually recorded. `useStockFormViewModel`
   * relies on this to surface `STOCK_FORM_SCREEN.ERROR.MOVEMENT_LOG_FAILED`
   * instead of silently dropping a failed insert — the count itself may have
   * already saved by the time this runs, so the caller must know the
   * history write specifically failed.
   */
  const logMovement = async (
    reason: string,
    previous: StockQuantities,
    next: StockQuantities
  ): Promise<boolean> => {
    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase
      .from("equipment_stock_movements")
      .insert({
        category_id: categoryId,
        created_by: adminWorkerId,
        from_available: previous.quantityAvailable,
        from_damaged: previous.quantityDamaged,
        from_in_repair: previous.quantityInRepair,
        reason,
        to_available: next.quantityAvailable,
        to_damaged: next.quantityDamaged,
        to_in_repair: next.quantityInRepair,
      })
      .select("id, created_at")
      .single();

    if (error || !data) {
      return false;
    }

    setMovements((current) => [
      {
        createdAt: data.created_at,
        fromAvailable: previous.quantityAvailable,
        fromDamaged: previous.quantityDamaged,
        fromInRepair: previous.quantityInRepair,
        id: data.id,
        reason,
        toAvailable: next.quantityAvailable,
        toDamaged: next.quantityDamaged,
        toInRepair: next.quantityInRepair,
      },
      ...current,
    ]);

    return true;
  };

  return { logMovement, movements };
};
