"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORY_FORM_SCREEN,
  CATEGORY_STATUS,
  PATHS,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  buildCategoryPayload,
  validateCategoryForm,
  type CategoryFormErrors,
} from "@/app/utils/administracion/categoryValidation";
import { useCategoryFieldsViewModel } from "./useCategoryFieldsViewModel";
import { useCategoryStatusActions } from "./useCategoryStatusActions";
import type { CategoryFormProps } from "../models/CategoryFormProps.interface";
import type { CategoryFormViewModel } from "../models/CategoryFormViewModel.interface";

const UNIQUE_VIOLATION_CODE = "23505";
const NO_ERRORS = 0;

/**
 * The facade behind `CategoryForm` (US-ADM-012 through US-ADM-015):
 * combines field state (`useCategoryFieldsViewModel`) and the
 * delete/deactivate/reactivate actions (`useCategoryStatusActions`) with
 * the one thing neither owns — the create/update submit itself. Both
 * writes go through the admin's own authenticated client directly:
 * `categories_insert` / `categories_update` already allow it, the same
 * shape `ProfileForm` uses for its own direct write.
 */
export const useCategoryFormViewModel = ({
  adminWorkerId,
  category,
  hasRecords,
}: CategoryFormProps): CategoryFormViewModel => {
  const router = useRouter();
  const isEditMode = Boolean(category);

  const { values, handleFieldChange, handleToggleField } =
    useCategoryFieldsViewModel(category);
  const statusActions = useCategoryStatusActions(
    category?.id ?? null,
    adminWorkerId,
    category?.status ?? CATEGORY_STATUS.ACTIVE
  );

  const [errors, setErrors] = useState<CategoryFormErrors>(
    {}
  );
  const [formError, setFormError] =
    useState<Nullable<string>>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const submit = async (): Promise<void> => {
    setIsSaving(true);

    const supabase = createBrowserSupabaseClient();
    const payload = buildCategoryPayload(values);

    const { error } = category
      ? await supabase
          .from("equipment_categories")
          .update({ ...payload, updated_by: adminWorkerId })
          .eq("id", category.id)
      : await supabase.from("equipment_categories").insert({
          ...payload,
          created_by: adminWorkerId,
          updated_by: adminWorkerId,
        });

    setIsSaving(false);

    if (error) {
      if (error.code === UNIQUE_VIOLATION_CODE) {
        setErrors((current) => ({
          ...current,
          name: CATEGORY_FORM_SCREEN.ERROR.NAME_TAKEN,
        }));
      } else {
        setFormError(CATEGORY_FORM_SCREEN.ERROR.GENERIC);
      }
      return;
    }

    router.replace(PATHS.ADMIN.CATEGORIES);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateCategoryForm(values);
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
    handleDeactivate: statusActions.handleDeactivate,
    handleDelete: statusActions.handleDelete,
    handleFieldChange,
    handleReactivate: statusActions.handleReactivate,
    handleSubmit,
    handleToggleField,
    isBusy: isSaving || statusActions.isBusy,
    isEditMode,
    isTrackingModeLocked: isEditMode && hasRecords,
    status: statusActions.status,
    values,
  };
};
