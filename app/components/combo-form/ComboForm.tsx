"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  COMBO_FORM_SCREEN,
  FIELD_IDS,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import FormField from "@/app/components/form-field/FormField";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Spinner from "@/app/components/spinner/Spinner";
import {
  COMBO_FIELD_CLASS,
  COMBO_FIELD_ERROR_CLASS,
} from "./comboFormStyles";
import { useComboFormViewModel } from "./hooks/useComboFormViewModel";
import ComboFormPrice from "./components/ComboFormPrice";
import ComboFormItems from "./components/ComboFormItems";
import ComboFormActions from "./components/ComboFormActions";
import type { ComboFormProps } from "./models/ComboFormProps.interface";

/**
 * `/administracion/combos/nueva` and `/administracion/combos/[comboId]`
 * (US-ADM-022, US-ADM-023). Presentation only — every decision lives in
 * `useComboFormViewModel`.
 */
const ComboForm = (props: ComboFormProps): JSX.Element => {
  const {
    canDelete,
    errors,
    formError,
    handleAddItem,
    handleDeactivate,
    handleDelete,
    handleAudienceChange,
    handleFieldChange,
    handleReactivate,
    handleRemoveItem,
    handleSubmit,
    handleUpdateItemQuantity,
    isBusy,
    isEditMode,
    items,
    itemsError,
    status,
    values,
  } = useComboFormViewModel(props);

  return (
    <form
      className="flex flex-col gap-md rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md"
      onSubmit={handleSubmit}
      noValidate
    >
      {formError && (
        <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
          {formError}
        </p>
      )}

      <FormField
        id={FIELD_IDS.COMBO_NAME}
        name={FIELD_IDS.COMBO_NAME}
        label={COMBO_FORM_SCREEN.NAME_LABEL}
        placeholder={COMBO_FORM_SCREEN.NAME_PLACEHOLDER}
        value={values.name}
        onChange={(event) =>
          handleFieldChange("name", event.target.value)
        }
        error={errors.name ?? undefined}
        showErrorText
        disabled={isBusy}
        classNameField={
          errors.name
            ? COMBO_FIELD_ERROR_CLASS
            : COMBO_FIELD_CLASS
        }
      />

      <ComboFormPrice
        isBusy={isBusy}
        onFieldChange={handleFieldChange}
        values={values}

        onAudienceChange={handleAudienceChange}
        priceError={errors.price}
      />

      <ComboFormItems
        categoryOptions={props.categoryOptions}
        isBusy={isBusy}
        isEditMode={isEditMode}
        items={items}
        itemsError={itemsError}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateItemQuantity={handleUpdateItemQuantity}
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
            <span>{COMBO_FORM_SCREEN.SUBMIT}</span>
            <MaterialIcon
              name={MATERIAL_ICON_NAME.SAVE}
              className="!text-[18px]"
            />
          </>
        )}
      </Button>

      {isEditMode && (
        <ComboFormActions
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

export default ComboForm;
