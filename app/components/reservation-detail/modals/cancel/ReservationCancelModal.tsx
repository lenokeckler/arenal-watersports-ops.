"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  MATERIAL_ICON_NAME,
  RESERVATION_DETAIL_SCREEN,
  RESERVATION_STATUS,
  SPINNER_SIZE,
  type ReservationStatus,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import ActionSheet from "@/app/components/action-sheet/ActionSheet";
import { useReservationCancelModalViewModel } from "./hooks/useReservationCancelModalViewModel";

interface ReservationCancelModalProps {
  onCancelled: () => void;
  onClose: () => void;
  reservationId: string;
  status: ReservationStatus;
  workerId: string;
}

const TEXTAREA_CLASS =
  "w-full resize-none rounded-lg border border-outline-variant bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** US-RES-021/US-RES-022: one cancel sheet, copy differs by status. */
const ReservationCancelModal = ({
  onCancelled,
  onClose,
  reservationId,
  status,
  workerId,
}: ReservationCancelModalProps): JSX.Element => {
  const {
    error,
    handleReasonChange,
    handleSubmit,
    isBusy,
    reason,
  } = useReservationCancelModalViewModel({
    onCancelled,
    reservationId,
    workerId,
  });

  const subtitle =
    status === RESERVATION_STATUS.DISPATCHED
      ? RESERVATION_DETAIL_SCREEN.CANCEL.SUBTITLE_DISPATCHED
      : RESERVATION_DETAIL_SCREEN.CANCEL.SUBTITLE_SCHEDULED;

  return (
    <ActionSheet
      icon={MATERIAL_ICON_NAME.CANCEL}
      onClose={onClose}
      title={RESERVATION_DETAIL_SCREEN.CANCEL.TITLE}
    >
      <div className="flex flex-col gap-md">
        <p className="font-body-base text-body-base text-on-surface-variant">
          {subtitle}
        </p>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="cancel-reason"
            className="font-label-mono text-label-mono uppercase text-on-surface-variant"
          >
            {RESERVATION_DETAIL_SCREEN.CANCEL.REASON_LABEL}
          </label>
          <textarea
            id="cancel-reason"
            rows={3}
            value={reason}
            disabled={isBusy}
            placeholder={
              RESERVATION_DETAIL_SCREEN.CANCEL
                .REASON_PLACEHOLDER
            }
            onChange={(event) =>
              handleReasonChange(event.target.value)
            }
            className={TEXTAREA_CLASS}
          />
          <p className="font-label-mono text-[10px] text-on-surface-variant">
            {RESERVATION_DETAIL_SCREEN.CANCEL.REASON_HINT}
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
            {error}
          </p>
        )}

        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          disabled={isBusy}
          onClick={handleSubmit}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-error px-md py-sm text-button uppercase text-on-error shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <Spinner size={SPINNER_SIZE.SMALL} />
          ) : (
            RESERVATION_DETAIL_SCREEN.CANCEL.CONFIRM
          )}
        </Button>
        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          disabled={isBusy}
          onClick={onClose}
          className="flex min-h-12 w-full items-center justify-center rounded-lg border border-outline-variant px-md text-button uppercase text-on-surface hover:bg-on-surface/5"
        >
          {RESERVATION_DETAIL_SCREEN.CANCEL.BACK}
        </Button>
      </div>
    </ActionSheet>
  );
};

export default ReservationCancelModal;
