import type { JSX } from "react";
import {
  COMBO_AUDIENCE,
  COMBO_AUDIENCE_LABEL,
  COMBO_FORM_SCREEN,
  FIELD_IDS,
  INPUT_TYPES,
  STRING,
  type ComboAudience,
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
  onAudienceChange: (audience: ComboAudience) => void;
  onFieldChange: (
    field: ComboStringField,
    value: string
  ) => void;
  priceError?: string;
  values: ComboFormValues;
}

const AUDIENCE_BUTTON_CLASS =
  "min-h-12 flex-1 rounded-lg border px-sm font-button text-button uppercase transition-colors disabled:opacity-50";

/**
 * US-ADM-023: el combo se vende como paquete, con precio propio y nunca la
 * suma de sus partes.
 *
 * El publico decide la moneda, asi que hay un solo campo de precio en vez de
 * un par: un combo de nacionales se cotiza en colones y uno de extranjeros en
 * dolares. Ofrecer las dos casillas invitaba justo a la mezcla que las dos
 * secciones existen para evitar, y la base la rechaza con
 * `combos_price_matches_audience`.
 */
const ComboFormPrice = ({
  isBusy,
  onAudienceChange,
  onFieldChange,
  priceError,
  values,
}: ComboFormPriceProps): JSX.Element => {
  const isNational =
    values.audience === COMBO_AUDIENCE.NATIONAL;

  return (
    <section className={COMBO_SECTION_CLASS}>
      <h2 className="font-title-md text-title-md text-on-surface">
        {COMBO_FORM_SCREEN.PACKAGE_PRICE.TITLE}
      </h2>

      <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
        {COMBO_FORM_SCREEN.AUDIENCE_LABEL}
      </span>
      <div className="flex gap-sm">
        {(
          [
            COMBO_AUDIENCE.NATIONAL,
            COMBO_AUDIENCE.FOREIGN,
          ] as const
        ).map((audience) => (
          <button
            key={audience}
            type="button"
            aria-pressed={values.audience === audience}
            disabled={isBusy}
            onClick={() => onAudienceChange(audience)}
            className={`${AUDIENCE_BUTTON_CLASS} ${
              values.audience === audience
                ? "border-primary bg-primary/20 text-primary"
                : "border-white/10 text-on-surface-variant hover:border-primary/40"
            }`}
          >
            {COMBO_AUDIENCE_LABEL[audience]}
          </button>
        ))}
      </div>

      <FormField
        id={
          isNational
            ? FIELD_IDS.PACKAGE_PRICE_CRC
            : FIELD_IDS.PACKAGE_PRICE_USD
        }
        name={
          isNational
            ? FIELD_IDS.PACKAGE_PRICE_CRC
            : FIELD_IDS.PACKAGE_PRICE_USD
        }
        label={
          isNational
            ? COMBO_FORM_SCREEN.PACKAGE_PRICE.CRC_LABEL
            : COMBO_FORM_SCREEN.PACKAGE_PRICE.USD_LABEL
        }
        labelSuffix={STRING.ASTERISK}
        type={INPUT_TYPES.NUMBER}
        value={values.price}
        onChange={(event) =>
          onFieldChange("price", event.target.value)
        }
        error={priceError}
        showErrorText
        disabled={isBusy}
        classNameField={COMBO_FIELD_CLASS}
      />
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {COMBO_FORM_SCREEN.PACKAGE_PRICE.HINT}
      </span>
    </section>
  );
};

export default ComboFormPrice;
