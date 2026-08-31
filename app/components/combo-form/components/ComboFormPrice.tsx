import type { JSX } from "react";
import {
  COMBO_FORM_SCREEN,
  FIELD_IDS,
  INPUT_TYPES,
  MONEY_LABEL,
  STRING,
} from "@/app/constants";
import FormField from "@/app/components/form-field/FormField";
import type { ComboFormValues } from "@/app/utils/administracion/comboValidation";
import type { ComboStringField } from "../models/ComboFormViewModel.interface";
import {
  COMBO_FIELD_CLASS,
  COMBO_SECTION_CLASS,
} from "../comboFormStyles";

interface ComboFormPriceProps {
  isBusy: boolean;
  onFieldChange: (
    field: ComboStringField,
    value: string
  ) => void;
  values: ComboFormValues;
}

/** US-ADM-023: the combo sells as a package, priced on its own — never the sum of its parts. */
const ComboFormPrice = ({
  isBusy,
  onFieldChange,
  values,
}: ComboFormPriceProps): JSX.Element => (
  <section className={COMBO_SECTION_CLASS}>
    <h2 className="font-title-md text-title-md text-on-surface">
      {COMBO_FORM_SCREEN.PACKAGE_PRICE.TITLE}
    </h2>

    <FormField
      id={FIELD_IDS.PACKAGE_PRICE_USD}
      name={FIELD_IDS.PACKAGE_PRICE_USD}
      label={COMBO_FORM_SCREEN.PACKAGE_PRICE.USD_LABEL}
      labelSuffix={STRING.Empty}
      type={INPUT_TYPES.NUMBER}
      value={values.packagePriceUsd}
      onChange={(event) =>
        onFieldChange("packagePriceUsd", event.target.value)
      }
      disabled={isBusy}
      classNameField={COMBO_FIELD_CLASS}
    />

    <FormField
      id={FIELD_IDS.PACKAGE_PRICE_CRC}
      name={FIELD_IDS.PACKAGE_PRICE_CRC}
      label={COMBO_FORM_SCREEN.PACKAGE_PRICE.CRC_LABEL}
      labelSuffix={STRING.Empty}
      type={INPUT_TYPES.NUMBER}
      value={values.packagePriceCrc}
      onChange={(event) =>
        onFieldChange("packagePriceCrc", event.target.value)
      }
      disabled={isBusy}
      classNameField={COMBO_FIELD_CLASS}
    />
    <span className="font-label-mono text-label-mono text-on-surface-variant">
      {MONEY_LABEL.CURRENCY_PAIR_HINT}
    </span>
  </section>
);

export default ComboFormPrice;
