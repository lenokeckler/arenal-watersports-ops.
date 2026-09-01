"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  EXTRA_FORM_SCREEN,
  FIELD_IDS,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import FormField from "@/app/components/form-field/FormField";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Spinner from "@/app/components/spinner/Spinner";
import { EXTRA_FIELD_CLASS, EXTRA_FIELD_ERROR_CLASS } from "./extraFormStyles";
import { useExtraFormViewModel } from "./hooks/useExtraFormViewModel";
import ExtraFormPrice from "./components/ExtraFormPrice";
import ExtraFormOccupies from "./components/ExtraFormOccupies";
import ExtraFormCompatibility from "./components/ExtraFormCompatibility";
import ExtraFormActions from "./components/ExtraFormActions";
import type { ExtraFormProps } from "./models/ExtraFormProps.interface";

/**
 * `/administracion/extras/nueva` and `/administracion/extras/[extraId]`
 * (US-ADM-019 through US-ADM-021). Presentation only — every decision lives
 * in `useExtraFormViewModel`.
 */
const ExtraForm = (props: ExtraFormProps): JSX.Element => {
  const {
    canDelete,
    errors,
    formError,
    handleDeactivate,
    handleDelete,
    handleFieldChange,
    handleReactivate,
    handleSubmit,
    handleToggleUnit,
    isBusy,
    isEditMode,
    status,
    values,
  } = useExtraFormViewModel(props);

  return (
    <form
      className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md"
      onSubmit={handleSubmit}
      noValidate
    >
      {formError && (
        <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
          {formError}
        </p>
      )}

      <FormField
        id={FIELD_IDS.EXTRA_NAME}
        name={FIELD_IDS.EXTRA_NAME}
        label={EXTRA_FORM_SCREEN.NAME_LABEL}
        placeholder={EXTRA_FORM_SCREEN.NAME_PLACEHOLDER}
        value={values.name}
        onChange={(event) => handleFieldChange("name", event.target.value)}
        error={errors.name ?? undefined}
        showErrorText
        disabled={isBusy}
        classNameField={errors.name ? EXTRA_FIELD_ERROR_CLASS : EXTRA_FIELD_CLASS}
      />

      <ExtraFormPrice
        isBusy={isBusy}
        onFieldChange={handleFieldChange}
        values={values}
      />

      <ExtraFormOccupies
        categoryOptions={props.quantityCategoryOptions}
        errors={errors}
        isBusy={isBusy}
        onFieldChange={handleFieldChange}
        values={values}
      />

      {isEditMode && (
        <ExtraFormCompatibility
          compatibleUnitIds={values.compatibleUnitIds}
          isBusy={isBusy}
          onToggleUnit={handleToggleUnit}
          unitOptions={props.unitOptions}
        />
      )}

      <Button
        type={BUTTON_TYPES.SUBMIT}
        variant={BUTTON.BASE}
        disabled={isBusy}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy ? (
          <Spinner size={SPINNER_SIZE.SMALL} />
        ) : (
          <>
            <span>{EXTRA_FORM_SCREEN.SUBMIT}</span>
            <MaterialIcon
              name={MATERIAL_ICON_NAME.SAVE}
              className="!text-[18px]"
            />
          </>
        )}
      </Button>

      {isEditMode && (
        <ExtraFormActions
          canDelete={canDelete}
          isBusy={isBusy}
          onDeactivate={handleDeactivate}
          onDelete={handleDelete}
          onReactivate={handleReactivate}
          status={status}
        />
      )}
    </form>
  );
};

export default ExtraForm;
