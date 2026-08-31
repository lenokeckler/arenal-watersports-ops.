"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  PATHS,
  RATE_FORM_SCREEN,
  STRING,
  type ReservationType,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  buildTariffAmountPayload,
  INITIAL_TARIFF_FORM_VALUES,
  validateNewTariffForm,
  validateTariffAmounts,
  type TariffFormErrors,
  type TariffFormValues,
} from "@/app/utils/administracion/tariffValidation";
import type { RateFormProps } from "../models/RateFormProps.interface";
import type { RateFormViewModel } from "../models/RateFormViewModel.interface";

const UNIQUE_VIOLATION_CODE = "23505";
const OPTION_SEPARATOR = ":";
const NO_ERRORS = 0;

const numberToField = (value: Nullable<number>): string =>
  value === null || value === undefined
    ? STRING.Empty
    : String(value);

/**
 * The facade behind `RateForm` (US-ADM-024, US-ADM-025). Category and type
 * are only ever chosen once, at creation — editing only ever touches the
 * amounts, since `unique (category_id, type)` means changing either in
 * place could collide with another row. Modifying an amount never rewrites
 * `reservation_charges`: those already keep the amount they were charged
 * with (US-ADM-025), so a plain `update` is all this needs.
 */
export const useRateFormViewModel = ({
  adminWorkerId,
  tariff,
}: RateFormProps): RateFormViewModel => {
  const router = useRouter();
  const isEditMode = Boolean(tariff);

  const [values, setValues] = useState<TariffFormValues>(
    () =>
      tariff
        ? {
            amountCrc: numberToField(tariff.amountCrc),
            amountUsd: numberToField(tariff.amountUsd),
            selectedOption: STRING.Empty,
          }
        : INITIAL_TARIFF_FORM_VALUES
  );
  const [errors, setErrors] = useState<TariffFormErrors>(
    {}
  );
  const [formError, setFormError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const handleFieldChange = (
    field: keyof TariffFormValues,
    value: string
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitEdit = async (): Promise<void> => {
    if (!tariff) {
      return;
    }

    setIsBusy(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("tariffs")
      .update({
        ...buildTariffAmountPayload(values),
        updated_by: adminWorkerId,
      })
      .eq("id", tariff.id);
    setIsBusy(false);

    if (error) {
      setFormError(RATE_FORM_SCREEN.ERROR.GENERIC);
      return;
    }

    router.replace(PATHS.ADMIN.RATES);
  };

  const submitCreate = async (): Promise<void> => {
    const [categoryId, type] = values.selectedOption.split(
      OPTION_SEPARATOR
    );

    setIsBusy(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("tariffs")
      .insert({
        ...buildTariffAmountPayload(values),
        category_id: categoryId,
        created_by: adminWorkerId,
        type: type as ReservationType,
        updated_by: adminWorkerId,
      });
    setIsBusy(false);

    if (error) {
      setFormError(
        error.code === UNIQUE_VIOLATION_CODE
          ? RATE_FORM_SCREEN.ERROR.CATEGORY_TYPE_TAKEN
          : RATE_FORM_SCREEN.ERROR.GENERIC
      );
      return;
    }

    router.replace(PATHS.ADMIN.RATES);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = isEditMode
      ? validateTariffAmounts(values)
      : validateNewTariffForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > NO_ERRORS) {
      return;
    }

    void (isEditMode ? submitEdit() : submitCreate());
  };

  return {
    errors,
    formError,
    handleFieldChange,
    handleSubmit,
    isBusy,
    isEditMode,
    values,
  };
};
