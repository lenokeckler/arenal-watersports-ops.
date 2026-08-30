import type { JSX } from "react";
import {
  CATEGORY_FORM_SCREEN,
  FIELD_IDS,
  INPUT_TYPES,
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

interface CategoryFormAlertsProps {
  errors: CategoryFormErrors;
  isBusy: boolean;
  onFieldChange: (
    field: CategoryStringField,
    value: string
  ) => void;
  values: CategoryFormValues;
}

/**
 * US-ADM-015: by quantity, by expiry, both, or neither — both fields stay
 * optional, since a category with no alert at all is a valid choice.
 */
const CategoryFormAlerts = ({
  errors,
  isBusy,
  onFieldChange,
  values,
}: CategoryFormAlertsProps): JSX.Element => (
  <section className={CATEGORY_SECTION_CLASS}>
    <h2 className="font-title-md text-title-md text-on-surface">
      {CATEGORY_FORM_SCREEN.ALERT.TITLE}
    </h2>

    <FormField
      id={FIELD_IDS.ALERT_MIN_QUANTITY}
      name={FIELD_IDS.ALERT_MIN_QUANTITY}
      label={CATEGORY_FORM_SCREEN.ALERT.MIN_QUANTITY_LABEL}
      type={INPUT_TYPES.NUMBER}
      value={values.alertMinQuantity}
      onChange={(event) =>
        onFieldChange(
          "alertMinQuantity",
          event.target.value
        )
      }
      error={errors.alertMinQuantity ?? undefined}
      showErrorText
      disabled={isBusy}
      classNameField={CATEGORY_FIELD_CLASS}
    />

    <FormField
      id={FIELD_IDS.ALERT_EXPIRY_DAYS}
      name={FIELD_IDS.ALERT_EXPIRY_DAYS}
      label={CATEGORY_FORM_SCREEN.ALERT.EXPIRY_DAYS_LABEL}
      type={INPUT_TYPES.NUMBER}
      value={values.alertExpiryDays}
      onChange={(event) =>
        onFieldChange("alertExpiryDays", event.target.value)
      }
      error={errors.alertExpiryDays ?? undefined}
      showErrorText
      disabled={isBusy}
      classNameField={CATEGORY_FIELD_CLASS}
    />
  </section>
);

export default CategoryFormAlerts;
