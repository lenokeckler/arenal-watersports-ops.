"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  EDITABLE_UNIT_STATUSES,
  FIELD_IDS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
  UNIT_FORM_SCREEN,
  UNIT_STATUS_LABEL,
  USAGE_METRIC_LABEL,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import FormField from "@/app/components/form-field/FormField";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Spinner from "@/app/components/spinner/Spinner";
import {
  UNIT_FIELD_CLASS,
  UNIT_FIELD_ERROR_CLASS,
} from "./unitFormStyles";
import { useUnitFormViewModel } from "./hooks/useUnitFormViewModel";
import UnitFormDecommission from "./components/UnitFormDecommission";
import type { UnitFormProps } from "./models/UnitFormProps.interface";

const STATUS_OPTIONS = EDITABLE_UNIT_STATUSES.map(
  (status) => ({
    key: status,
    label: UNIT_STATUS_LABEL[status],
    value: status,
  })
);

/**
 * `/administracion/unidades/[categoryId]/nueva` and
 * `/administracion/unidades/[categoryId]/[unitId]` (US-ADM-016,
 * US-ADM-018). Presentation only — every decision lives in
 * `useUnitFormViewModel`.
 */
const UnitForm = (props: UnitFormProps): JSX.Element => {
  const { consumesFuel, hasMotor, usageMetric } = props;
  const {
    errors,
    formError,
    handleDecommission,
    handleFieldChange,
    handleSubmit,
    isBusy,
    isDecommissioned,
    isEditMode,
    values,
  } = useUnitFormViewModel(props);

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
        id={FIELD_IDS.CODE}
        name={FIELD_IDS.CODE}
        label={UNIT_FORM_SCREEN.CODE_LABEL}
        placeholder={UNIT_FORM_SCREEN.CODE_PLACEHOLDER}
        value={values.code}
        onChange={(event) =>
          handleFieldChange("code", event.target.value)
        }
        error={errors.code ?? undefined}
        showErrorText
        disabled={isBusy || isDecommissioned}
        classNameField={
          errors.code
            ? UNIT_FIELD_ERROR_CLASS
            : UNIT_FIELD_CLASS
        }
      />

      <FormField
        id={FIELD_IDS.UNIT_STATUS}
        name={FIELD_IDS.UNIT_STATUS}
        label={UNIT_FORM_SCREEN.STATUS_LABEL}
        type={INPUT_TYPES.SELECT}
        options={STATUS_OPTIONS}
        value={values.status}
        onChange={(event) =>
          handleFieldChange("status", event.target.value)
        }
        disabled={isBusy || isDecommissioned}
        classNameField={UNIT_FIELD_CLASS}
      />

      {consumesFuel && (
        <FormField
          id={FIELD_IDS.CURRENT_FUEL}
          name={FIELD_IDS.CURRENT_FUEL}
          label={UNIT_FORM_SCREEN.CURRENT_FUEL_LABEL}
          type={INPUT_TYPES.NUMBER}
          value={values.currentFuel}
          onChange={(event) =>
            handleFieldChange(
              "currentFuel",
              event.target.value
            )
          }
          error={errors.currentFuel ?? undefined}
          showErrorText
          disabled={isBusy || isDecommissioned}
          classNameField={
            errors.currentFuel
              ? UNIT_FIELD_ERROR_CLASS
              : UNIT_FIELD_CLASS
          }
        />
      )}

      {hasMotor && (
        <>
          <FormField
            id={FIELD_IDS.USAGE_TOTAL}
            name={FIELD_IDS.USAGE_TOTAL}
            label={
              usageMetric
                ? `${UNIT_FORM_SCREEN.USAGE_TOTAL_LABEL} (${USAGE_METRIC_LABEL[usageMetric]})`
                : UNIT_FORM_SCREEN.USAGE_TOTAL_LABEL
            }
            type={INPUT_TYPES.NUMBER}
            value={values.usageTotal}
            onChange={(event) =>
              handleFieldChange(
                "usageTotal",
                event.target.value
              )
            }
            disabled={isBusy || isDecommissioned}
            classNameField={UNIT_FIELD_CLASS}
          />
          <FormField
            id={FIELD_IDS.NEXT_OIL_CHANGE_AT}
            name={FIELD_IDS.NEXT_OIL_CHANGE_AT}
            label={UNIT_FORM_SCREEN.NEXT_OIL_CHANGE_LABEL}
            type={INPUT_TYPES.NUMBER}
            value={values.nextOilChangeAt}
            onChange={(event) =>
              handleFieldChange(
                "nextOilChangeAt",
                event.target.value
              )
            }
            disabled={isBusy || isDecommissioned}
            classNameField={UNIT_FIELD_CLASS}
          />
        </>
      )}

      {!isDecommissioned && (
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
              <span>{UNIT_FORM_SCREEN.SUBMIT}</span>
              <MaterialIcon
                name={MATERIAL_ICON_NAME.SAVE}
                className="!text-[18px]"
              />
            </>
          )}
        </Button>
      )}

      {isEditMode && (
        <UnitFormDecommission
          isBusy={isBusy}
          isDecommissioned={isDecommissioned}
          onDecommission={handleDecommission}
        />
      )}
    </form>
  );
};

export default UnitForm;
