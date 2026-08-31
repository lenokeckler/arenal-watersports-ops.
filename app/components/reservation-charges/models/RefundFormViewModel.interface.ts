import type { NullableRef } from "@/app/types";
import type { CurrencyCode } from "@/app/constants";
import type { RefundFormErrors } from "@/app/utils/reservas/reservationMoneyValidation";

export interface RefundFormViewModel {
  computedAmount: number;
  currency: CurrencyCode;
  errors: RefundFormErrors;
  handleCurrencyChange: (value: CurrencyCode) => void;
  handlePercentageChange: (value: string) => void;
  handleReasonChange: (value: string) => void;
  handleSubmit: () => void;
  isBusy: boolean;
  percentage: string;
  reason: string;
  /** What is still left to give back in this currency (US-RES-028). */
  refundableAmount: number;
  submitError: NullableRef<string>;
}
