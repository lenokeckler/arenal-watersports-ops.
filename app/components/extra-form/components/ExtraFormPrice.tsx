import type { JSX } from "react";
import { EXTRA_FORM_SCREEN, FIELD_IDS, INPUT_TYPES } from "@/app/constants";
import FormField from "@/app/components/form-field/FormField";
import type { ExtraFormValues } from "@/app/utils/administracion/extraValidation";
import type { ExtraStringField } from "../models/ExtraFormViewModel.interface";
import { EXTRA_FIELD_CLASS, EXTRA_SECTION_CLASS } from "../extraFormStyles";

interface ExtraFormPriceProps {
  isBusy: boolean;
  onFieldChange: (field: ExtraStringField, value: string) => void;
  values: ExtraFormValues;
}

/** US-ADM-019: both currencies stay optional, same as `CategoryFormDeposit`. */
const ExtraFormPrice = ({
  isBusy,
  onFieldChange,
  values,
}: ExtraFormPriceProps): JSX.Element => (
  <section className={EXTRA_SECTION_CLASS}>
    <h2 className="font-title-md text-title-md text-on-surface">
      {EXTRA_FORM_SCREEN.PRICE.TITLE}
    </h2>

    <FormField
      id={FIELD_IDS.PRICE_USD}
      name={FIELD_IDS.PRICE_USD}
      label={EXTRA_FORM_SCREEN.PRICE.USD_LABEL}
      type={INPUT_TYPES.NUMBER}
      value={values.priceUsd}
      onChange={(event) => onFieldChange("priceUsd", event.target.value)}
      disabled={isBusy}
      classNameField={EXTRA_FIELD_CLASS}
    />

    <FormField
      id={FIELD_IDS.PRICE_CRC}
      name={FIELD_IDS.PRICE_CRC}
      label={EXTRA_FORM_SCREEN.PRICE.CRC_LABEL}
      type={INPUT_TYPES.NUMBER}
      value={values.priceCrc}
      onChange={(event) => onFieldChange("priceCrc", event.target.value)}
      disabled={isBusy}
      classNameField={EXTRA_FIELD_CLASS}
    />
  </section>
);

export default ExtraFormPrice;
