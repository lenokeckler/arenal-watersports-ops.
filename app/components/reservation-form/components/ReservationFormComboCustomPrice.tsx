import type { JSX } from "react";
import {
  FIELD_IDS,
  INPUT_TYPES,
  NEW_RESERVATION_SCREEN,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import FormField from "@/app/components/form-field/FormField";
import PriceAmounts from "@/app/components/price-amounts/PriceAmounts";
import {
  FIELD_CLASS,
  SECTION_CLASS,
} from "../reservationFormStyles";

interface ReservationFormComboCustomPriceProps {
  agreedAmount: string;
  isBusy: boolean;
  onAgreedAmountChange: (value: string) => void;
  suggestedAmountCrc: Nullable<number>;
  suggestedAmountUsd: Nullable<number>;
}

/**
 * US-RES-010: the suggested price is the sum of each picked category's
 * individual tariff — computed in `useReservationFormViewModel`, never
 * charged here (that is `reservation_charges`, EP-RES-07). Reservas can
 * override it in "monto acordado" when the client agreed to something else.
 */
const ReservationFormComboCustomPrice = ({
  agreedAmount,
  isBusy,
  onAgreedAmountChange,
  suggestedAmountCrc,
  suggestedAmountUsd,
}: ReservationFormComboCustomPriceProps): JSX.Element => (
  <section className={SECTION_CLASS}>
    <div className="flex items-center justify-between gap-sm">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {NEW_RESERVATION_SCREEN.COMBO.CUSTOM_PRICE_LABEL}
      </span>
      <PriceAmounts
        amountCrc={suggestedAmountCrc}
        amountUsd={suggestedAmountUsd}
      />
    </div>
    <p className="font-label-mono text-label-mono text-on-surface-variant">
      {NEW_RESERVATION_SCREEN.COMBO.CUSTOM_HINT}
    </p>
    <FormField
      id={FIELD_IDS.AGREED_AMOUNT}
      name={FIELD_IDS.AGREED_AMOUNT}
      label={
        NEW_RESERVATION_SCREEN.COMBO.CUSTOM_PRICE_LABEL
      }
      type={INPUT_TYPES.NUMBER}
      value={agreedAmount}
      onChange={(event) =>
        onAgreedAmountChange(event.target.value)
      }
      disabled={isBusy}
      classNameField={FIELD_CLASS}
    />
  </section>
);

export default ReservationFormComboCustomPrice;
