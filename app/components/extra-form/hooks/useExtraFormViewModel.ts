"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_STATUS, EXTRA_FORM_SCREEN, PATHS } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  buildExtraPayload,
  validateExtraForm,
  type ExtraFormErrors,
} from "@/app/utils/administracion/extraValidation";
import { useExtraFieldsViewModel } from "./useExtraFieldsViewModel";
import { useExtraStatusActions } from "./useExtraStatusActions";
import { useExtraCompatibility } from "./useExtraCompatibility";
import type { ExtraFormProps } from "../models/ExtraFormProps.interface";
import type { ExtraFormViewModel } from "../models/ExtraFormViewModel.interface";

const UNIQUE_VIOLATION_CODE = "23505";
const NO_ERRORS = 0;

/**
 * The facade behind `ExtraForm` (US-ADM-019 through US-ADM-021): combines
 * field state, status actions, and compatibility toggles with the one thing
 * none of them own — the create/update submit itself. Both writes go
 * through the admin's own authenticated client directly (`extras_insert` /
 * `extras_update` already allow it), the same shape `useCategoryFormViewModel`
 * uses.
 */
export const useExtraFormViewModel = ({
  adminWorkerId,
  extra,
  hasRecords,
}: ExtraFormProps): ExtraFormViewModel => {
  const router = useRouter();
  const isEditMode = Boolean(extra);

  const { values, handleFieldChange } = useExtraFieldsViewModel(extra);
  const statusActions = useExtraStatusActions(
    extra?.id ?? null,
    adminWorkerId,
    extra?.status ?? CATEGORY_STATUS.ACTIVE
  );
  const compatibility = useExtraCompatibility(
    extra?.id ?? null,
    extra?.compatibleUnitIds ?? []
  );

  const [errors, setErrors] = useState<ExtraFormErrors>({});
  const [formError, setFormError] = useState<Nullable<string>>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const submit = async (): Promise<void> => {
    setIsSaving(true);

    const supabase = createBrowserSupabaseClient();
    const payload = buildExtraPayload(values);

    const { error } = extra
      ? await supabase
          .from("extras")
          .update({ ...payload, updated_by: adminWorkerId })
          .eq("id", extra.id)
      : await supabase.from("extras").insert({
          ...payload,
          created_by: adminWorkerId,
          updated_by: adminWorkerId,
        });

    setIsSaving(false);

    if (error) {
      if (error.code === UNIQUE_VIOLATION_CODE) {
        setErrors((current) => ({
          ...current,
          name: EXTRA_FORM_SCREEN.ERROR.NAME_TAKEN,
        }));
      } else {
        setFormError(EXTRA_FORM_SCREEN.ERROR.GENERIC);
      }
      return;
    }

    router.replace(PATHS.ADMIN.EXTRAS);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateExtraForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > NO_ERRORS) {
      return;
    }

    void submit();
  };

  return {
    canDelete: isEditMode && !hasRecords,
    errors,
    formError:
      formError ?? statusActions.actionError ?? compatibility.actionError,
    handleDeactivate: statusActions.handleDeactivate,
    handleDelete: statusActions.handleDelete,
    handleFieldChange,
    handleReactivate: statusActions.handleReactivate,
    handleSubmit,
    handleToggleUnit: compatibility.handleToggleUnit,
    isBusy: isSaving || statusActions.isBusy || compatibility.isBusy,
    isEditMode,
    status: statusActions.status,
    values: { ...values, compatibleUnitIds: compatibility.compatibleUnitIds },
  };
};
