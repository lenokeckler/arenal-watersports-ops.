import type { JSX } from "react";
import {
  CATEGORY_FORM_SCREEN,
  FIELD_IDS,
  INPUT_TYPES,
  MONEY_LABEL,
  STRING,
} from "@/app/constants";
import FormField from "@/app/components/form-field/FormField";
import type {
  CategoryFormErrors,
  CategoryFormValues,
} from "@/app/utils/administracion/categoryValidation";
import type { CategoryStringField } from "../models/CategoryFormViewModel.interface";
import {
  CATEGORY_FIELD_CLASS,
  CATEGORY_SECTION_CLASS,
} from "../categoryFormStyles";

interface CategoryFormDepositProps {
  errors: CategoryFormErrors;
  isBusy: boolean;
  onFieldChange: (
    field: CategoryStringField,
    value: string
  ) => void;
  values: CategoryFormValues;
}

/**
 * US-ADM-014: both currencies stay optional — there are categories with no
 * deposit at all, and administración decides which ones carry one.
 */
const CategoryFormDeposit = ({
  errors,
  isBusy,
  onFieldChange,
  values,
}: CategoryFormDepositProps): JSX.Element => (
  <section className={CATEGORY_SECTION_CLASS}>
    <h2 className="font-title-md text-title-md text-on-surface">
      {CATEGORY_FORM_SCREEN.DEPOSIT.TITLE}
    </h2>

    <FormField
      id={FIELD_IDS.DEPOSIT_USD}
      name={FIELD_IDS.DEPOSIT_USD}
      label={CATEGORY_FORM_SCREEN.DEPOSIT.USD_LABEL}
      labelSuffix={STRING.Empty}
      type={INPUT_TYPES.NUMBER}
      value={values.depositUsd}
      onChange={(event) =>
        onFieldChange("depositUsd", event.target.value)
      }
      error={errors.depositUsd ?? undefined}
      showErrorText
      disabled={isBusy}
      classNameField={CATEGORY_FIELD_CLASS}
    />

    <FormField
      id={FIELD_IDS.DEPOSIT_CRC}
      name={FIELD_IDS.DEPOSIT_CRC}
      label={CATEGORY_FORM_SCREEN.DEPOSIT.CRC_LABEL}
      labelSuffix={STRING.Empty}
      type={INPUT_TYPES.NUMBER}
      value={values.depositCrc}
      onChange={(event) =>
        onFieldChange("depositCrc", event.target.value)
      }
      error={errors.depositCrc ?? undefined}
      showErrorText
      disabled={isBusy}
      classNameField={CATEGORY_FIELD_CLASS}
    />
    <span className="font-label-mono text-label-mono text-on-surface-variant">
      {MONEY_LABEL.CURRENCY_PAIR_HINT}
    </span>
  </section>
);

export default CategoryFormDeposit;
