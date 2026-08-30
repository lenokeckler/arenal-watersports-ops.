"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { STRING, STOCK_FORM_SCREEN } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  buildStockPayload,
  haveQuantitiesChanged,
  parseQuantities,
  validateStockForm,
  type StockFormErrors,
  type StockFormValues,
  type StockQuantities,
} from "@/app/utils/administracion/stockValidation";
import { useStockMovementLog } from "./useStockMovementLog";
import type { StockFormProps } from "../models/StockFormProps.interface";
import type { StockFormViewModel } from "../models/StockFormViewModel.interface";

const NO_ERRORS = 0;

/**
 * The facade behind `StockForm` (US-ADM-017). A `by_quantity` category has
 * no ficha to decommission — `useStockMovementLog`'s history is the only
 * trace a count ever changed. Both writes go through the caller's own
 * authenticated client directly (`stock_update` / `stock_insert` /
 * `stock_movements_insert` already allow it for `operaciones` or an admin).
 */
export const useStockFormViewModel = ({
  adminWorkerId,
  categoryId,
  movements: initialMovements,
  stock,
}: StockFormProps): StockFormViewModel => {
  const router = useRouter();
  const { logMovement, movements } = useStockMovementLog(
    categoryId,
    adminWorkerId,
    initialMovements
  );

  const [savedQuantities, setSavedQuantities] =
    useState<StockQuantities>({
      quantityAvailable: stock?.quantityAvailable ?? 0,
      quantityDamaged: stock?.quantityDamaged ?? 0,
      quantityInRepair: stock?.quantityInRepair ?? 0,
    });
  const [values, setValues] = useState<StockFormValues>(
    () => ({
      expiryDate:
        stock?.expiryDate?.slice(0, 10) ?? STRING.Empty,
      quantityAvailable: String(
        savedQuantities.quantityAvailable
      ),
      quantityDamaged: String(
        savedQuantities.quantityDamaged
      ),
      quantityInRepair: String(
        savedQuantities.quantityInRepair
      ),
      reason: STRING.Empty,
    })
  );
  const [errors, setErrors] = useState<StockFormErrors>({});
  const [formError, setFormError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const handleFieldChange = (
    field: keyof StockFormValues,
    value: string
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = async (
    hasQuantityChange: boolean
  ): Promise<void> => {
    setIsBusy(true);

    const supabase = createBrowserSupabaseClient();
    const nextQuantities = parseQuantities(values);
    const payload = buildStockPayload(values);

    const { error } = stock
      ? await supabase
          .from("equipment_stock")
          .update({ ...payload, updated_by: adminWorkerId })
          .eq("category_id", categoryId)
      : await supabase.from("equipment_stock").insert({
          ...payload,
          category_id: categoryId,
          updated_by: adminWorkerId,
        });

    if (error) {
      setIsBusy(false);
      setFormError(STOCK_FORM_SCREEN.ERROR.GENERIC);
      return;
    }

    if (hasQuantityChange) {
      const loggedSuccessfully = await logMovement(
        values.reason.trim(),
        savedQuantities,
        nextQuantities
      );

      if (!loggedSuccessfully) {
        setIsBusy(false);
        setFormError(
          STOCK_FORM_SCREEN.ERROR.MOVEMENT_LOG_FAILED
        );
        return;
      }

      setSavedQuantities(nextQuantities);
    }

    setIsBusy(false);
    setValues((current) => ({
      ...current,
      reason: STRING.Empty,
    }));
    router.refresh();
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setFormError(null);

    const nextQuantities = parseQuantities(values);
    const hasQuantityChange = haveQuantitiesChanged(
      savedQuantities,
      nextQuantities
    );
    const nextErrors = validateStockForm(
      values,
      hasQuantityChange
    );
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > NO_ERRORS) {
      return;
    }

    void submit(hasQuantityChange);
  };

  return {
    errors,
    formError,
    handleFieldChange,
    handleSubmit,
    isBusy,
    movements,
    values,
  };
};
