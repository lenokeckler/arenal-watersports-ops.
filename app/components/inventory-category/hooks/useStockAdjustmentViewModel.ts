"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OPERATIONS_INVENTORY_SCREEN,
  STRING,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import type { StockDetail } from "@/app/utils/administracion/stock";
import { applyStockAdjustment } from "@/app/utils/operaciones/stockAdjustment";

export interface StockAdjustmentFormValues {
  quantityAvailable: string;
  quantityDamaged: string;
  quantityInRepair: string;
  reason: string;
}

export interface StockAdjustmentViewModel {
  error: Nullable<string>;
  handleFieldChange: (
    field: keyof StockAdjustmentFormValues,
    value: string
  ) => void;
  handleSubmit: () => void;
  isBusy: boolean;
  values: StockAdjustmentFormValues;
}

const FALLBACK_QUANTITY = 0;

const toQuantity = (raw: string): number =>
  Number(raw) || FALLBACK_QUANTITY;

/**
 * US-OPE-022 and US-OPE-025 for a `by_quantity` category. The form starts
 * on what the system currently says, because here the operator is
 * restating the whole count rather than nudging one value — and the reason
 * is mandatory, since the movement it produces is the only history this
 * kind of category has.
 */
export const useStockAdjustmentViewModel = (
  categoryId: string,
  stock: StockDetail,
  workerId: string
): StockAdjustmentViewModel => {
  const router = useRouter();
  const [values, setValues] =
    useState<StockAdjustmentFormValues>({
      quantityAvailable: String(stock.quantityAvailable),
      quantityDamaged: String(stock.quantityDamaged),
      quantityInRepair: String(stock.quantityInRepair),
      reason: STRING.Empty,
    });
  const [error, setError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleFieldChange = (
    field: keyof StockAdjustmentFormValues,
    value: string
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (): void => {
    if (!values.reason.trim()) {
      setError(
        OPERATIONS_INVENTORY_SCREEN.DETAIL.REASON_REQUIRED
      );
      return;
    }

    setIsBusy(true);
    setError(null);

    void applyStockAdjustment(
      createBrowserSupabaseClient(),
      {
        categoryId,
        next: {
          quantityAvailable: toQuantity(
            values.quantityAvailable
          ),
          quantityDamaged: toQuantity(
            values.quantityDamaged
          ),
          quantityInRepair: toQuantity(
            values.quantityInRepair
          ),
        },
        previous: {
          quantityAvailable: stock.quantityAvailable,
          quantityDamaged: stock.quantityDamaged,
          quantityInRepair: stock.quantityInRepair,
        },
        reason: values.reason.trim(),
        workerId,
      }
    )
      .then(() => {
        setValues((current) => ({
          ...current,
          reason: STRING.Empty,
        }));
        setIsBusy(false);
        router.refresh();
      })
      .catch(() => {
        setIsBusy(false);
        setError(OPERATIONS_INVENTORY_SCREEN.DETAIL.ERROR);
      });
  };

  return {
    error,
    handleFieldChange,
    handleSubmit,
    isBusy,
    values,
  };
};
