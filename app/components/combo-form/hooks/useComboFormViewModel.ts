"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORY_STATUS,
  COMBO_FORM_SCREEN,
  PATHS,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  buildComboPayload,
  validateComboForm,
  type ComboFormErrors,
} from "@/app/utils/administracion/comboValidation";
import { useComboFieldsViewModel } from "./useComboFieldsViewModel";
import { useComboStatusActions } from "./useComboStatusActions";
import { useComboItems } from "./useComboItems";
import type { ComboFormProps } from "../models/ComboFormProps.interface";
import type { ComboFormViewModel } from "../models/ComboFormViewModel.interface";

const UNIQUE_VIOLATION_CODE = "23505";
const NO_ERRORS = 0;

/**
 * The facade behind `ComboForm` (US-ADM-022, US-ADM-023): combines field
 * state, status actions, and item management with the one thing none of
 * them own — the create/update submit itself. Both writes go through the
 * admin's own authenticated client directly (`combos_insert` /
 * `combos_update` already allow it), the same shape `useCategoryFormViewModel`
 * and `useExtraFormViewModel` use.
 */
export const useComboFormViewModel = ({
  adminWorkerId,
  categoryOptions,
  combo,
  hasRecords,
}: ComboFormProps): ComboFormViewModel => {
  const router = useRouter();
  const isEditMode = Boolean(combo);

  const {
    handleAudienceChange,
    handleFieldChange,
    values,
  } = useComboFieldsViewModel(combo);
  const statusActions = useComboStatusActions(
    combo?.id ?? null,
    adminWorkerId,
    combo?.status ?? CATEGORY_STATUS.ACTIVE
  );
  const itemsState = useComboItems(
    combo?.id ?? null,
    combo?.items ?? [],
    categoryOptions
  );

  const [errors, setErrors] = useState<ComboFormErrors>({});
  const [formError, setFormError] =
    useState<Nullable<string>>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const submit = async (): Promise<void> => {
    setIsSaving(true);

    const supabase = createBrowserSupabaseClient();
    const payload = buildComboPayload(values);

    const { error } = combo
      ? await supabase
          .from("combos")
          .update({ ...payload, updated_by: adminWorkerId })
          .eq("id", combo.id)
      : await supabase.from("combos").insert({
          ...payload,
          created_by: adminWorkerId,
          updated_by: adminWorkerId,
        });

    setIsSaving(false);

    if (error) {
      if (error.code === UNIQUE_VIOLATION_CODE) {
        setErrors((current) => ({
          ...current,
          name: COMBO_FORM_SCREEN.ERROR.NAME_TAKEN,
        }));
      } else {
        setFormError(COMBO_FORM_SCREEN.ERROR.GENERIC);
      }
      return;
    }

    router.replace(PATHS.ADMIN.COMBOS);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateComboForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > NO_ERRORS) {
      return;
    }

    void submit();
  };

  return {
    canDelete: isEditMode && !hasRecords,
    errors,
    formError: formError ?? statusActions.actionError,
    handleAddItem: itemsState.handleAddItem,
    handleDeactivate: statusActions.handleDeactivate,
    handleDelete: statusActions.handleDelete,
    handleAudienceChange,
    handleFieldChange,
    handleReactivate: statusActions.handleReactivate,
    handleRemoveItem: itemsState.handleRemoveItem,
    handleSubmit,
    handleUpdateItemQuantity:
      itemsState.handleUpdateItemQuantity,
    isBusy:
      isSaving || statusActions.isBusy || itemsState.isBusy,
    isEditMode,
    items: itemsState.items,
    itemsError: itemsState.itemsError,
    status: statusActions.status,
    values,
  };
};
