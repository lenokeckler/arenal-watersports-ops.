"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  FIELD_IDS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  RATE_FORM_SCREEN,
  RESERVATION_TYPE_LABEL,
  SPINNER_SIZE,
  STRING,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import FormField from "@/app/components/form-field/FormField";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Spinner from "@/app/components/spinner/Spinner";
import {
  RATE_FIELD_CLASS,
  RATE_FIELD_ERROR_CLASS,
} from "./rateFormStyles";
import { useRateFormViewModel } from "./hooks/useRateFormViewModel";
import type { RateFormProps } from "./models/RateFormProps.interface";

/**
 * `/administracion/tarifas/nueva` and `/administracion/tarifas/[tariffId]`
 * (US-ADM-024, US-ADM-025). Presentation only — every decision lives in
 * `useRateFormViewModel`. Category and type are fixed once created; editing
 * only ever shows the amount fields.
 */
const RateForm = (props: RateFormProps): JSX.Element => {
  const {
    errors,
    formError,
    handleFieldChange,
    handleSubmit,
    isBusy,
    isEditMode,
    values,
  } = useRateFormViewModel(props);

  const optionSelectOptions = [
    {
      key: STRING.Empty,
      label: STRING.Empty,
      value: STRING.Empty,
    },
    ...props.availableOptions.map((option) => ({
      key: `${option.categoryId}:${option.type}`,
      label: `${option.categoryName} — ${RESERVATION_TYPE_LABEL[option.type]}`,
      value: `${option.categoryId}:${option.type}`,
    })),
  ];

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

      {isEditMode ? (
        <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm">
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {RATE_FORM_SCREEN.CATEGORY_LABEL}
          </span>
          <span className="font-body-base text-body-base text-on-surface">
            {props.tariff?.categoryName}
            {" — "}
            {props.tariff &&
              RESERVATION_TYPE_LABEL[props.tariff.type]}
          </span>
        </div>
      ) : (
        <FormField
          id={FIELD_IDS.TARIFF_CATEGORY}
          name={FIELD_IDS.TARIFF_CATEGORY}
          label={RATE_FORM_SCREEN.CATEGORY_LABEL}
          type={INPUT_TYPES.SELECT}
          options={optionSelectOptions}
          value={values.selectedOption}
          onChange={(event) =>
            handleFieldChange(
              "selectedOption",
              event.target.value
            )
          }
          error={errors.selectedOption ?? undefined}
          showErrorText
          disabled={isBusy}
          classNameField={
            errors.selectedOption
              ? RATE_FIELD_ERROR_CLASS
              : RATE_FIELD_CLASS
          }
        />
      )}

      <p className="font-label-mono text-label-mono text-on-surface-variant">
        {RATE_FORM_SCREEN.AMOUNT.HINT}
      </p>

      <FormField
        id={FIELD_IDS.TARIFF_AMOUNT_USD}
        name={FIELD_IDS.TARIFF_AMOUNT_USD}
        label={RATE_FORM_SCREEN.AMOUNT.USD_LABEL}
        type={INPUT_TYPES.NUMBER}
        value={values.amountUsd}
        onChange={(event) =>
          handleFieldChange("amountUsd", event.target.value)
        }
        error={errors.amount ?? undefined}
        showErrorText
        disabled={isBusy}
        classNameField={
          errors.amount
            ? RATE_FIELD_ERROR_CLASS
            : RATE_FIELD_CLASS
        }
      />

      <FormField
        id={FIELD_IDS.TARIFF_AMOUNT_CRC}
        name={FIELD_IDS.TARIFF_AMOUNT_CRC}
        label={RATE_FORM_SCREEN.AMOUNT.CRC_LABEL}
        type={INPUT_TYPES.NUMBER}
        value={values.amountCrc}
        onChange={(event) =>
          handleFieldChange("amountCrc", event.target.value)
        }
        disabled={isBusy}
        classNameField={RATE_FIELD_CLASS}
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
            <span>{RATE_FORM_SCREEN.SUBMIT}</span>
            <MaterialIcon
              name={MATERIAL_ICON_NAME.SAVE}
              className="!text-[18px]"
            />
          </>
        )}
      </Button>
    </form>
  );
};

export default RateForm;
