"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  CATEGORY_FORM_SCREEN,
  FIELD_IDS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
  STRING,
  TRACKING_MODE,
  TRACKING_MODE_LABEL,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import FormField from "@/app/components/form-field/FormField";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Spinner from "@/app/components/spinner/Spinner";
import {
  CATEGORY_FIELD_CLASS,
  CATEGORY_FIELD_ERROR_CLASS,
} from "./categoryFormStyles";
import { useCategoryFormViewModel } from "./hooks/useCategoryFormViewModel";
import CategoryFormBehavior from "./components/CategoryFormBehavior";
import CategoryFormAlerts from "./components/CategoryFormAlerts";
import CategoryFormDeposit from "./components/CategoryFormDeposit";
import CategoryFormActions from "./components/CategoryFormActions";
import type { CategoryFormProps } from "./models/CategoryFormProps.interface";

const TRACKING_MODE_OPTIONS = Object.values(
  TRACKING_MODE
).map((mode) => ({
  key: mode,
  label: TRACKING_MODE_LABEL[mode],
  value: mode,
}));

/**
 * `/administracion/categorias/nueva` and
 * `/administracion/categorias/[categoryId]` (US-ADM-012 through
 * US-ADM-015). Presentation only — every decision lives in
 * `useCategoryFormViewModel`.
 */
const CategoryForm = (
  props: CategoryFormProps
): JSX.Element => {
  const {
    canDelete,
    errors,
    formError,
    handleDeactivate,
    handleDelete,
    handleFieldChange,
    handleReactivate,
    handleSubmit,
    handleToggleField,
    isBusy,
    isEditMode,
    isTrackingModeLocked,
    status,
    values,
  } = useCategoryFormViewModel(props);

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
        id={FIELD_IDS.CATEGORY_NAME}
        name={FIELD_IDS.CATEGORY_NAME}
        label={CATEGORY_FORM_SCREEN.NAME_LABEL}
        placeholder={CATEGORY_FORM_SCREEN.NAME_PLACEHOLDER}
        value={values.name}
        onChange={(event) =>
          handleFieldChange("name", event.target.value)
        }
        error={errors.name ?? undefined}
        showErrorText
        disabled={isBusy}
        classNameField={
          errors.name
            ? CATEGORY_FIELD_ERROR_CLASS
            : CATEGORY_FIELD_CLASS
        }
      />

      <div className="flex flex-col gap-xs">
        <FormField
          id={FIELD_IDS.GROUP_NAME}
          name={FIELD_IDS.GROUP_NAME}
          label={CATEGORY_FORM_SCREEN.GROUP_NAME_LABEL}
          placeholder={
            CATEGORY_FORM_SCREEN.GROUP_NAME_PLACEHOLDER
          }
          labelSuffix={STRING.Empty}
          value={values.groupName}
          onChange={(event) =>
            handleFieldChange(
              "groupName",
              event.target.value
            )
          }
          disabled={isBusy}
          classNameField={CATEGORY_FIELD_CLASS}
        />
        <span className="font-label-mono text-label-mono text-on-surface-variant">
          {CATEGORY_FORM_SCREEN.GROUP_NAME_HINT}
        </span>
      </div>

      <div className="flex flex-col gap-xs">
        <FormField
          id={FIELD_IDS.TRACKING_MODE}
          name={FIELD_IDS.TRACKING_MODE}
          label={CATEGORY_FORM_SCREEN.TRACKING_MODE_LABEL}
          type={INPUT_TYPES.SELECT}
          options={TRACKING_MODE_OPTIONS}
          value={values.trackingMode}
          onChange={(event) =>
            handleFieldChange(
              "trackingMode",
              event.target.value
            )
          }
          disabled={isBusy || isTrackingModeLocked}
          classNameField={CATEGORY_FIELD_CLASS}
        />
        {isTrackingModeLocked && (
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {CATEGORY_FORM_SCREEN.TRACKING_MODE_LOCKED_HINT}
          </span>
        )}
      </div>

      <CategoryFormBehavior
        errors={errors}
        isBusy={isBusy}
        onFieldChange={handleFieldChange}
        onToggleField={handleToggleField}
        values={values}
      />

      <CategoryFormAlerts
        errors={errors}
        isBusy={isBusy}
        onFieldChange={handleFieldChange}
        values={values}
      />

      <CategoryFormDeposit
        errors={errors}
        isBusy={isBusy}
        onFieldChange={handleFieldChange}
        values={values}
      />

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
            <span>{CATEGORY_FORM_SCREEN.SUBMIT}</span>
            <MaterialIcon
              name={MATERIAL_ICON_NAME.SAVE}
              className="!text-[18px]"
            />
          </>
        )}
      </Button>

      {isEditMode && (
        <CategoryFormActions
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

export default CategoryForm;
