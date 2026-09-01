"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  FIELD_IDS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
  STOCK_FORM_SCREEN,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import FormField from "@/app/components/form-field/FormField";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Spinner from "@/app/components/spinner/Spinner";
import {
  STOCK_FIELD_CLASS,
  STOCK_FIELD_ERROR_CLASS,
} from "./stockFormStyles";
import { useStockFormViewModel } from "./hooks/useStockFormViewModel";
import StockFormHistory from "./components/StockFormHistory";
import type { StockFormProps } from "./models/StockFormProps.interface";

/**
 * `/administracion/unidades/[categoryId]` for a `by_quantity` category
 * (US-ADM-017). Presentation only — every decision lives in
 * `useStockFormViewModel`.
 */
const StockForm = (props: StockFormProps): JSX.Element => {
  const {
    errors,
    formError,
    handleFieldChange,
    handleSubmit,
    isBusy,
    movements,
    values,
  } = useStockFormViewModel(props);

  return (
    <div className="flex flex-col gap-md">
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
          id={FIELD_IDS.QUANTITY_AVAILABLE}
          name={FIELD_IDS.QUANTITY_AVAILABLE}
          label={STOCK_FORM_SCREEN.QUANTITY_AVAILABLE_LABEL}
          type={INPUT_TYPES.NUMBER}
          value={values.quantityAvailable}
          onChange={(event) =>
            handleFieldChange(
              "quantityAvailable",
              event.target.value
            )
          }
          disabled={isBusy}
          classNameField={STOCK_FIELD_CLASS}
        />

        <FormField
          id={FIELD_IDS.QUANTITY_DAMAGED}
          name={FIELD_IDS.QUANTITY_DAMAGED}
          label={STOCK_FORM_SCREEN.QUANTITY_DAMAGED_LABEL}
          type={INPUT_TYPES.NUMBER}
          value={values.quantityDamaged}
          onChange={(event) =>
            handleFieldChange(
              "quantityDamaged",
              event.target.value
            )
          }
          disabled={isBusy}
          classNameField={STOCK_FIELD_CLASS}
        />

        <FormField
          id={FIELD_IDS.QUANTITY_IN_REPAIR}
          name={FIELD_IDS.QUANTITY_IN_REPAIR}
          label={STOCK_FORM_SCREEN.QUANTITY_IN_REPAIR_LABEL}
          type={INPUT_TYPES.NUMBER}
          value={values.quantityInRepair}
          onChange={(event) =>
            handleFieldChange(
              "quantityInRepair",
              event.target.value
            )
          }
          disabled={isBusy}
          classNameField={STOCK_FIELD_CLASS}
        />

        <FormField
          id={FIELD_IDS.EXPIRY_DATE}
          name={FIELD_IDS.EXPIRY_DATE}
          label={STOCK_FORM_SCREEN.EXPIRY_DATE_LABEL}
          type={INPUT_TYPES.DATE}
          value={values.expiryDate}
          onChange={(event) =>
            handleFieldChange(
              "expiryDate",
              event.target.value
            )
          }
          disabled={isBusy}
          classNameField={STOCK_FIELD_CLASS}
        />

        <FormField
          id={FIELD_IDS.REASON}
          name={FIELD_IDS.REASON}
          label={STOCK_FORM_SCREEN.REASON_LABEL}
          placeholder={STOCK_FORM_SCREEN.REASON_PLACEHOLDER}
          value={values.reason}
          onChange={(event) =>
            handleFieldChange("reason", event.target.value)
          }
          error={errors.reason ?? undefined}
          showErrorText
          disabled={isBusy}
          classNameField={
            errors.reason
              ? STOCK_FIELD_ERROR_CLASS
              : STOCK_FIELD_CLASS
          }
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
              <span>{STOCK_FORM_SCREEN.SUBMIT}</span>
              <MaterialIcon
                name={MATERIAL_ICON_NAME.SAVE}
                className="!text-[18px]"
              />
            </>
          )}
        </Button>
      </form>

      <StockFormHistory movements={movements} />
    </div>
  );
};

export default StockForm;
