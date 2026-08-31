"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  PATHS,
  STRING,
  UNIT_FORM_SCREEN,
  UNIT_STATUS,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  buildUnitPayload,
  validateUnitForm,
  type UnitFormErrors,
  type UnitFormValues,
} from "@/app/utils/administracion/unitValidation";
import type { UnitDetail } from "@/app/utils/administracion/units";
import { useUnitDecommission } from "./useUnitDecommission";
import type { UnitFormProps } from "../models/UnitFormProps.interface";
import type { UnitFormViewModel } from "../models/UnitFormViewModel.interface";

const UNIQUE_VIOLATION_CODE = "23505";
const NO_ERRORS = 0;

const toInitialValues = (
  unit: Nullable<UnitDetail>
): UnitFormValues => ({
  code: unit?.code ?? STRING.Empty,
  currentFuel:
    unit?.currentFuel?.toString() ?? STRING.Empty,
  nextOilChangeAt:
    unit?.nextOilChangeAt?.toString() ?? STRING.Empty,
  status: unit?.status ?? UNIT_STATUS.AVAILABLE,
  usageTotal: unit?.usageTotal?.toString() ?? STRING.Empty,
});

/**
 * The facade behind `UnitForm` (US-ADM-016, US-ADM-018). Create and update
 * go through the caller's own authenticated client directly — `units_insert`
 * / `units_update` already allow it for `operaciones` or an admin.
 * Decommissioning lives in `useUnitDecommission`, its own terminal action.
 */
export const useUnitFormViewModel = ({
  adminWorkerId,
  categoryId,
  unit,
}: UnitFormProps): UnitFormViewModel => {
  const router = useRouter();
  const isEditMode = Boolean(unit);
  const isDecommissioned =
    unit?.status === UNIT_STATUS.DECOMMISSIONED;
  const decommission = useUnitDecommission(
    unit,
    categoryId,
    adminWorkerId
  );

  const [values, setValues] = useState<UnitFormValues>(() =>
    toInitialValues(unit)
  );
  const [errors, setErrors] = useState<UnitFormErrors>({});
  const [formError, setFormError] =
    useState<Nullable<string>>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleFieldChange = (
    field: keyof UnitFormValues,
    value: string
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = async (): Promise<void> => {
    setIsSaving(true);

    const supabase = createBrowserSupabaseClient();
    const payload = buildUnitPayload(values);

    const { error } = unit
      ? await supabase
          .from("equipment_units")
          .update({ ...payload, updated_by: adminWorkerId })
          .eq("id", unit.id)
      : await supabase.from("equipment_units").insert({
          ...payload,
          category_id: categoryId,
          created_by: adminWorkerId,
          updated_by: adminWorkerId,
        });

    setIsSaving(false);

    if (error) {
      if (error.code === UNIQUE_VIOLATION_CODE) {
        setErrors((current) => ({
          ...current,
          code: UNIT_FORM_SCREEN.ERROR.CODE_TAKEN,
        }));
      } else {
        setFormError(UNIT_FORM_SCREEN.ERROR.GENERIC);
      }
      return;
    }

    router.replace(PATHS.ADMIN.UNIT_CATEGORY(categoryId));
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateUnitForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > NO_ERRORS) {
      return;
    }

    void submit();
  };

  return {
    errors,
    formError: formError ?? decommission.formError,
    handleDecommission: decommission.handleDecommission,
    handleFieldChange,
    handleSubmit,
    isBusy: isSaving || decommission.isBusy,
    isDecommissioned,
    isEditMode,
    values,
  };
};
