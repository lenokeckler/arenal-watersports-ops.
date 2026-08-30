import type { JSX } from "react";
import {
  CATEGORY_FORM_SCREEN,
  FIELD_IDS,
  INPUT_TYPES,
  TRACKING_MODE,
  USAGE_METRIC,
  USAGE_METRIC_LABEL,
} from "@/app/constants";
import FormField from "@/app/components/form-field/FormField";
import type {
  CategoryFormErrors,
  CategoryFormValues,
} from "@/app/utils/administracion/categoryValidation";
import type {
  CategoryBooleanField,
  CategoryStringField,
} from "../models/CategoryFormViewModel.interface";
import {
  CATEGORY_FIELD_CLASS,
  CATEGORY_SECTION_CLASS,
} from "../categoryFormStyles";
import CategoryFormToggle from "./CategoryFormToggle";

interface CategoryFormBehaviorProps {
  errors: CategoryFormErrors;
  isBusy: boolean;
  onFieldChange: (
    field: CategoryStringField,
    value: string
  ) => void;
  onToggleField: (
    field: CategoryBooleanField,
    checked: boolean
  ) => void;
  values: CategoryFormValues;
}

const USAGE_METRIC_OPTIONS = Object.values(
  USAGE_METRIC
).map((metric) => ({
  key: metric,
  label: USAGE_METRIC_LABEL[metric],
  value: metric,
}));

/**
 * US-ADM-013: what makes a jet ski behave differently from a remo without
 * programming each case one by one.
 */
const CategoryFormBehavior = ({
  errors,
  isBusy,
  onFieldChange,
  onToggleField,
  values,
}: CategoryFormBehaviorProps): JSX.Element => (
  <section className={CATEGORY_SECTION_CLASS}>
    <h2 className="font-title-md text-title-md text-on-surface">
      {CATEGORY_FORM_SCREEN.BEHAVIOR.TITLE}
    </h2>

    <CategoryFormToggle
      checked={values.isReservable}
      disabled={isBusy}
      label={CATEGORY_FORM_SCREEN.BEHAVIOR.IS_RESERVABLE}
      onChange={(checked) =>
        onToggleField("isReservable", checked)
      }
    />
    {values.isReservable && (
      <FormField
        id={FIELD_IDS.DEFAULT_DURATION_MINUTES}
        name={FIELD_IDS.DEFAULT_DURATION_MINUTES}
        label={
          CATEGORY_FORM_SCREEN.BEHAVIOR
            .DEFAULT_DURATION_LABEL
        }
        type={INPUT_TYPES.NUMBER}
        value={values.defaultDurationMinutes}
        onChange={(event) =>
          onFieldChange(
            "defaultDurationMinutes",
            event.target.value
          )
        }
        error={errors.defaultDurationMinutes ?? undefined}
        showErrorText
        disabled={isBusy}
        classNameField={CATEGORY_FIELD_CLASS}
      />
    )}

    <CategoryFormToggle
      checked={values.hasMotor}
      disabled={isBusy}
      label={CATEGORY_FORM_SCREEN.BEHAVIOR.HAS_MOTOR}
      onChange={(checked) =>
        onToggleField("hasMotor", checked)
      }
    />
    {values.hasMotor && (
      <FormField
        id={FIELD_IDS.USAGE_METRIC}
        name={FIELD_IDS.USAGE_METRIC}
        label={
          CATEGORY_FORM_SCREEN.BEHAVIOR.USAGE_METRIC_LABEL
        }
        type={INPUT_TYPES.SELECT}
        options={USAGE_METRIC_OPTIONS}
        value={values.usageMetric ?? undefined}
        onChange={(event) =>
          onFieldChange("usageMetric", event.target.value)
        }
        error={errors.usageMetric ?? undefined}
        showErrorText
        disabled={isBusy}
        classNameField={CATEGORY_FIELD_CLASS}
      />
    )}

    <CategoryFormToggle
      checked={values.consumesFuel}
      disabled={isBusy}
      label={CATEGORY_FORM_SCREEN.BEHAVIOR.CONSUMES_FUEL}
      onChange={(checked) =>
        onToggleField("consumesFuel", checked)
      }
    />
    <CategoryFormToggle
      checked={values.canBeDamaged}
      disabled={isBusy}
      label={CATEGORY_FORM_SCREEN.BEHAVIOR.CAN_BE_DAMAGED}
      onChange={(checked) =>
        onToggleField("canBeDamaged", checked)
      }
    />
    <CategoryFormToggle
      checked={values.hasConditionPhotos}
      disabled={
        isBusy ||
        values.trackingMode !== TRACKING_MODE.BY_UNIT
      }
      label={
        CATEGORY_FORM_SCREEN.BEHAVIOR.HAS_CONDITION_PHOTOS
      }
      onChange={(checked) =>
        onToggleField("hasConditionPhotos", checked)
      }
    />
    <CategoryFormToggle
      checked={values.guideOnly}
      disabled={isBusy}
      label={CATEGORY_FORM_SCREEN.BEHAVIOR.GUIDE_ONLY}
      onChange={(checked) =>
        onToggleField("guideOnly", checked)
      }
    />
  </section>
);

export default CategoryFormBehavior;
