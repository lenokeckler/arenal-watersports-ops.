import type { JSX } from "react";
import { EXTRA_FORM_SCREEN, FIELD_IDS, INPUT_TYPES, STRING } from "@/app/constants";
import FormField from "@/app/components/form-field/FormField";
import type { QuantityCategoryOption } from "@/app/utils/administracion/extras";
import type {
  ExtraFormErrors,
  ExtraFormValues,
} from "@/app/utils/administracion/extraValidation";
import type { ExtraStringField } from "../models/ExtraFormViewModel.interface";
import { EXTRA_FIELD_CLASS, EXTRA_SECTION_CLASS } from "../extraFormStyles";

interface ExtraFormOccupiesProps {
  categoryOptions: QuantityCategoryOption[];
  errors: ExtraFormErrors;
  isBusy: boolean;
  onFieldChange: (field: ExtraStringField, value: string) => void;
  values: ExtraFormValues;
}

/**
 * US-ADM-021: some extras are just a charge; the ones that occupy real
 * inventory pick one `by_quantity` category and how much of it they use,
 * mirroring `extras_occupies_shape`.
 */
const ExtraFormOccupies = ({
  categoryOptions,
  errors,
  isBusy,
  onFieldChange,
  values,
}: ExtraFormOccupiesProps): JSX.Element => {
  const categorySelectOptions = [
    {
      key: STRING.Empty,
      label: EXTRA_FORM_SCREEN.OCCUPIES.CATEGORY_NONE_OPTION,
      value: STRING.Empty,
    },
    ...categoryOptions.map((category) => ({
      key: category.id,
      label: category.name,
      value: category.id,
    })),
  ];

  return (
    <section className={EXTRA_SECTION_CLASS}>
      <h2 className="font-title-md text-title-md text-on-surface">
        {EXTRA_FORM_SCREEN.OCCUPIES.TITLE}
      </h2>
      <p className="font-label-mono text-label-mono text-on-surface-variant">
        {EXTRA_FORM_SCREEN.OCCUPIES.HINT}
      </p>

      <FormField
        id={FIELD_IDS.OCCUPIES_CATEGORY_ID}
        name={FIELD_IDS.OCCUPIES_CATEGORY_ID}
        label={EXTRA_FORM_SCREEN.OCCUPIES.CATEGORY_LABEL}
        type={INPUT_TYPES.SELECT}
        options={categorySelectOptions}
        value={values.occupiesCategoryId}
        onChange={(event) =>
          onFieldChange("occupiesCategoryId", event.target.value)
        }
        disabled={isBusy}
        classNameField={EXTRA_FIELD_CLASS}
      />

      {values.occupiesCategoryId && (
        <FormField
          id={FIELD_IDS.OCCUPIES_QUANTITY}
          name={FIELD_IDS.OCCUPIES_QUANTITY}
          label={EXTRA_FORM_SCREEN.OCCUPIES.QUANTITY_LABEL}
          type={INPUT_TYPES.NUMBER}
          value={values.occupiesQuantity}
          onChange={(event) =>
            onFieldChange("occupiesQuantity", event.target.value)
          }
          error={errors.occupiesQuantity ?? undefined}
          showErrorText
          disabled={isBusy}
          classNameField={EXTRA_FIELD_CLASS}
        />
      )}
    </section>
  );
};

export default ExtraFormOccupies;
