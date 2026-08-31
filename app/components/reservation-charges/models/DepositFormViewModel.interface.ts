import type { NullableRef } from "@/app/types";
import type {
  CurrencyCode,
  DepositStatus,
} from "@/app/constants";
import type { DepositResolutionErrors } from "@/app/utils/reservas/reservationMoneyValidation";

export interface DepositRegisterViewModel {
  amount: string;
  amountError: NullableRef<string>;
  currency: CurrencyCode;
  handleAmountChange: (value: string) => void;
  handleCurrencyChange: (value: CurrencyCode) => void;
  handleSubmit: () => void;
  handleUseProposal: () => void;
  isBusy: boolean;
  proposedAmount: NullableRef<number>;
  submitError: NullableRef<string>;
}

export interface DepositResolutionViewModel {
  errors: DepositResolutionErrors;
  handleReasonChange: (value: string) => void;
  handleRetainedAmountChange: (value: string) => void;
  handleStatusChange: (value: DepositStatus) => void;
  handleSubmit: () => void;
  isBusy: boolean;
  retainedAmount: string;
  retentionReason: string;
  status: DepositStatus;
  submitError: NullableRef<string>;
}
