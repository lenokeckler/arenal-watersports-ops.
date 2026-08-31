import type { NullableRef } from "@/app/types";
import type {
  ChargeKind,
  CurrencyCode,
} from "@/app/constants";
import type { ChargeFormErrors } from "@/app/utils/reservas/reservationMoneyValidation";

export interface ChargeFormViewModel {
  amount: string;
  currency: CurrencyCode;
  errors: ChargeFormErrors;
  handleAmountChange: (value: string) => void;
  handleCurrencyChange: (value: CurrencyCode) => void;
  handleKindChange: (value: ChargeKind) => void;
  handleMethodChange: (value: string) => void;
  handleSubmit: () => void;
  handleUseProposal: () => void;
  isBusy: boolean;
  /** US-RES-019: the tariff of a split child stayed on the original reservation. */
  isTariffBlocked: boolean;
  kind: ChargeKind;
  method: string;
  /** Free text only when the worker picked "Otro" (US-RES-027). */
  otherMethod: string;
  handleOtherMethodChange: (value: string) => void;
  proposedAmount: NullableRef<number>;
  submitError: NullableRef<string>;
}
