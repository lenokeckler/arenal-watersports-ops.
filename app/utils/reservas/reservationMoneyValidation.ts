import {
  DEPOSIT_STATUS,
  MONEY_NUMBERS,
  RESERVATION_CHARGES_SCREEN,
  type DepositStatus,
} from "@/app/constants";
import type { NullableRef } from "@/app/types";

export interface ChargeFormErrors {
  amount?: string;
  paymentMethod?: string;
}

export interface RefundFormErrors {
  percentage?: string;
  reason?: string;
}

export interface DepositResolutionErrors {
  retainedAmount?: string;
  retentionReason?: string;
}

const isChargeableAmount = (amount: number): boolean =>
  Number.isFinite(amount) &&
  amount >= MONEY_NUMBERS.MIN_AMOUNT;

/** US-RES-023/US-RES-027: a positive amount and a method, nothing else. */
export const validateChargeForm = (
  amount: number,
  paymentMethod: string
): ChargeFormErrors => {
  const errors: ChargeFormErrors = {};
  if (!isChargeableAmount(amount)) {
    errors.amount =
      RESERVATION_CHARGES_SCREEN.CHARGE_FORM.ERROR.AMOUNT_REQUIRED;
  }
  if (!paymentMethod.trim()) {
    errors.paymentMethod =
      RESERVATION_CHARGES_SCREEN.CHARGE_FORM.ERROR.METHOD_REQUIRED;
  }
  return errors;
};

/** US-RES-029: the deposit received needs a positive amount. */
export const validateDepositAmount = (
  amount: number
): NullableRef<string> =>
  isChargeableAmount(amount)
    ? null
    : RESERVATION_CHARGES_SCREEN.DEPOSIT.ERROR
        .AMOUNT_REQUIRED;

export interface RefundValidationParams {
  computedAmount: number;
  percentage: number;
  reason: string;
  refundableAmount: number;
}

/**
 * US-RES-028: the percentage is bounded by the database
 * (`percentage > 0 and percentage <= 100`), but nothing in the schema
 * stops a refund from exceeding what was charged. That ceiling lives
 * here, so the reservation's net income can never go below zero.
 */
export const validateRefundForm = ({
  computedAmount,
  percentage,
  reason,
  refundableAmount,
}: RefundValidationParams): RefundFormErrors => {
  const errors: RefundFormErrors = {};

  if (
    !Number.isFinite(percentage) ||
    percentage < MONEY_NUMBERS.MIN_REFUND_PERCENTAGE ||
    percentage > MONEY_NUMBERS.MAX_REFUND_PERCENTAGE
  ) {
    errors.percentage =
      RESERVATION_CHARGES_SCREEN.REFUND.ERROR.PERCENTAGE_RANGE;
  } else if (refundableAmount < MONEY_NUMBERS.MIN_AMOUNT) {
    errors.percentage =
      RESERVATION_CHARGES_SCREEN.REFUND.ERROR.NOTHING_CHARGED;
  } else if (computedAmount > refundableAmount) {
    errors.percentage =
      RESERVATION_CHARGES_SCREEN.REFUND.ERROR.OVER_NET;
  }

  if (!reason.trim()) {
    errors.reason =
      RESERVATION_CHARGES_SCREEN.REFUND.ERROR.REASON_REQUIRED;
  }
  return errors;
};

export interface DepositResolutionParams {
  depositAmount: number;
  retainedAmount: number;
  retentionReason: string;
  status: DepositStatus;
}

/**
 * US-RES-030: returning the deposit in full asks for nothing. Retaining
 * needs how much and why — `deposits_retention_needs_reason` and
 * `deposits_retained_within_amount` say the same at the database level;
 * this only says it before the round trip, in the worker's language.
 */
export const validateDepositResolution = ({
  depositAmount,
  retainedAmount,
  retentionReason,
  status,
}: DepositResolutionParams): DepositResolutionErrors => {
  if (status === DEPOSIT_STATUS.RETURNED) {
    return {};
  }

  const errors: DepositResolutionErrors = {};
  if (!isChargeableAmount(retainedAmount)) {
    errors.retainedAmount =
      RESERVATION_CHARGES_SCREEN.DEPOSIT.ERROR.RETAINED_REQUIRED;
  } else if (retainedAmount > depositAmount) {
    errors.retainedAmount =
      RESERVATION_CHARGES_SCREEN.DEPOSIT.ERROR.RETAINED_OVER_AMOUNT;
  }
  if (!retentionReason.trim()) {
    errors.retentionReason =
      RESERVATION_CHARGES_SCREEN.DEPOSIT.ERROR.REASON_REQUIRED;
  }
  return errors;
};
