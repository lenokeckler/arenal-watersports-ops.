"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  RESERVATION_DETAIL_SCREEN,
  SPINNER_SIZE,
  type ReservationStatus,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import ActionSheet from "@/app/components/action-sheet/ActionSheet";
import { useReservationPostponeModalViewModel } from "./hooks/useReservationPostponeModalViewModel";
import ReservationPostponeClosingRow from "./components/ReservationPostponeClosingRow";

interface ReservationPostponeModalProps {
  onClose: () => void;
  onPostponed: () => void;
  reservationId: string;
  startsAt: string;
  status: ReservationStatus;
  workerId: string;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-white/10 bg-surface-container-low p-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** US-RES-020: reschedules a reservation, closing its equipment first if it was already dispatched. */
const ReservationPostponeModal = ({
  onClose,
  onPostponed,
  reservationId,
  startsAt,
  status,
  workerId,
}: ReservationPostponeModalProps): JSX.Element => {
  const {
    closings,
    date,
    error,
    handleDateChange,
    handleFuelChange,
    handleSubmit,
    handleTimeChange,
    handleUsageChange,
    isBusy,
    isDispatched,
    isLoadingClosings,
    time,
  } = useReservationPostponeModalViewModel({
    onPostponed,
    reservationId,
    startsAt,
    status,
    workerId,
  });

  return (
    <ActionSheet
      icon={MATERIAL_ICON_NAME.SCHEDULE}
      onClose={onClose}
      title={RESERVATION_DETAIL_SCREEN.POSTPONE.TITLE}
    >
      <div className="flex flex-col gap-md">
        <p className="rounded-lg border border-primary/20 bg-primary/10 p-sm font-body-base text-[14px] leading-tight text-on-surface">
          {
            RESERVATION_DETAIL_SCREEN.POSTPONE
              .SCHEDULED_NOTICE
          }
        </p>
        {isDispatched && (
          <p className="rounded-lg border border-error/30 bg-error/10 p-sm font-body-base text-[14px] leading-tight text-on-surface">
            {
              RESERVATION_DETAIL_SCREEN.POSTPONE
                .DISPATCHED_WARNING
            }
          </p>
        )}

        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
              {
                RESERVATION_DETAIL_SCREEN.POSTPONE
                  .DATE_LABEL
              }
            </span>
            <input
              type={INPUT_TYPES.DATE}
              value={date}
              disabled={isBusy}
              onChange={(event) =>
                handleDateChange(event.target.value)
              }
              className={FIELD_CLASS}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
              {
                RESERVATION_DETAIL_SCREEN.POSTPONE
                  .TIME_LABEL
              }
            </span>
            <input
              type={INPUT_TYPES.TIME}
              value={time}
              disabled={isBusy}
              onChange={(event) =>
                handleTimeChange(event.target.value)
              }
              className={FIELD_CLASS}
            />
          </label>
        </div>

        {isDispatched && (
          <div className="flex flex-col gap-sm">
            <h3 className="font-title-md text-title-md text-on-surface">
              {
                RESERVATION_DETAIL_SCREEN.POSTPONE
                  .CLOSING_TITLE
              }
            </h3>
            {isLoadingClosings ? (
              <Spinner size={SPINNER_SIZE.SMALL} />
            ) : (
              closings.map((closing) => (
                <ReservationPostponeClosingRow
                  key={closing.itemId}
                  closing={closing}
                  isBusy={isBusy}
                  onFuelChange={handleFuelChange}
                  onUsageChange={handleUsageChange}
                />
              ))
            )}
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
            {error}
          </p>
        )}

        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          disabled={isBusy || isLoadingClosings}
          onClick={handleSubmit}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <Spinner size={SPINNER_SIZE.SMALL} />
          ) : (
            RESERVATION_DETAIL_SCREEN.POSTPONE.SUBMIT
          )}
        </Button>
      </div>
    </ActionSheet>
  );
};

export default ReservationPostponeModal;
