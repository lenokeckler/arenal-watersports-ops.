"use client";

import type { JSX } from "react";
import {
  DEPOSIT_STATUS,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import type { DepositRecord } from "@/app/utils/reservas/reservationMovementRecords";
import { useDepositResolutionViewModel } from "../hooks/useDepositResolutionViewModel";
import MoneyField from "./MoneyField";
import SubmitRow from "./SubmitRow";

interface DepositResolutionFormProps {
  deposit: DepositRecord;
  onSaved: () => void;
}

const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-white/10 bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const TEXTAREA_ROWS = 2;
const OPTION_CLASS =
  "min-h-12 flex-1 rounded-lg border px-sm font-button text-button uppercase transition-colors disabled:opacity-60";

const RESOLUTION_OPTIONS = [
  {
    LABEL:
      RESERVATION_CHARGES_SCREEN.DEPOSIT.RESOLUTION.RETURN,
    STATUS: DEPOSIT_STATUS.RETURNED,
  },
  {
    LABEL:
      RESERVATION_CHARGES_SCREEN.DEPOSIT.RESOLUTION
        .RETAIN_PARTIAL,
    STATUS: DEPOSIT_STATUS.PARTIALLY_RETAINED,
  },
  {
    LABEL:
      RESERVATION_CHARGES_SCREEN.DEPOSIT.RESOLUTION
        .RETAIN_TOTAL,
    STATUS: DEPOSIT_STATUS.RETAINED,
  },
] as const;

/**
 * US-RES-030: released in full when the equipment came back in order, or
 * retained in part or in whole with how much and why. The retained amount
 * is what enters the revenue report as money the company kept.
 */
const DepositResolutionForm = ({
  deposit,
  onSaved,
}: DepositResolutionFormProps): JSX.Element => {
  const viewModel = useDepositResolutionViewModel({
    deposit,
    onSaved,
  });
  const isReturn =
    viewModel.status === DEPOSIT_STATUS.RETURNED;

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-wrap gap-sm">
        {RESOLUTION_OPTIONS.map((option) => (
          <button
            key={option.STATUS}
            type="button"
            disabled={viewModel.isBusy}
            onClick={() =>
              viewModel.handleStatusChange(option.STATUS)
            }
            className={`${OPTION_CLASS} ${
              option.STATUS === viewModel.status
                ? "border-primary bg-primary/15 text-primary"
                : "border-white/10 text-on-surface-variant hover:border-primary/40"
            }`}
          >
            {option.LABEL}
          </button>
        ))}
      </div>

      {isReturn ? (
        <p className="font-label-mono text-label-mono text-on-surface-variant">
          {
            RESERVATION_CHARGES_SCREEN.DEPOSIT.RESOLUTION
              .RETURN_HINT
          }
        </p>
      ) : (
        <>
          <MoneyField
            error={viewModel.errors.retainedAmount}
            isBusy={viewModel.isBusy}
            label={
              RESERVATION_CHARGES_SCREEN.DEPOSIT.RESOLUTION
                .RETAINED_LABEL
            }
            onChange={viewModel.handleRetainedAmountChange}
            value={viewModel.retainedAmount}
          />
          <label className="flex flex-col gap-1">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
              {
                RESERVATION_CHARGES_SCREEN.DEPOSIT
                  .RESOLUTION.REASON_LABEL
              }
            </span>
            <textarea
              rows={TEXTAREA_ROWS}
              value={viewModel.retentionReason}
              disabled={viewModel.isBusy}
              placeholder={
                RESERVATION_CHARGES_SCREEN.DEPOSIT
                  .RESOLUTION.REASON_PLACEHOLDER
              }
              onChange={(event) =>
                viewModel.handleReasonChange(
                  event.target.value
                )
              }
              className={TEXTAREA_CLASS}
            />
            {viewModel.errors.retentionReason && (
              <span className="font-label-mono text-label-mono text-error">
                {viewModel.errors.retentionReason}
              </span>
            )}
          </label>
        </>
      )}

      <SubmitRow
        error={viewModel.submitError}
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.DEPOSIT.RESOLUTION
            .SUBMIT
        }
        onSubmit={viewModel.handleSubmit}
      />
    </div>
  );
};

export default DepositResolutionForm;
