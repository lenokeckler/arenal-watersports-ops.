"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  RESERVATION_DETAIL_SCREEN,
  RESERVATION_NUMBERS,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import type { ReservationDetail } from "@/app/utils/reservas/reservationDetail";
import ActionSheet from "@/app/components/action-sheet/ActionSheet";
import { useReservationSplitModalViewModel } from "./hooks/useReservationSplitModalViewModel";
import ReservationSplitItemRow from "./components/ReservationSplitItemRow";

interface ReservationSplitModalProps {
  onClose: () => void;
  onSplit: () => void;
  reservation: ReservationDetail;
  workerId: string;
}

/** US-RES-019: split a reservation into two departures, no charge splitting. */
const ReservationSplitModal = ({
  onClose,
  onSplit,
  reservation,
  workerId,
}: ReservationSplitModalProps): JSX.Element => {
  const {
    error,
    handleMovingQuantityChange,
    handleNewPeopleCountChange,
    handleSubmit,
    isBusy,
    isLoadingItems,
    items,
    newPeopleCount,
    remainingPeopleCount,
  } = useReservationSplitModalViewModel({
    onSplit,
    reservation,
    workerId,
  });

  return (
    <ActionSheet
      icon={MATERIAL_ICON_NAME.CALL_SPLIT}
      onClose={onClose}
      title={RESERVATION_DETAIL_SCREEN.SPLIT.TITLE}
    >
      <div className="flex flex-col gap-md">
        <div className="grid grid-cols-2 gap-sm">
          <div className="flex flex-col items-center gap-1 rounded-lg border border-outline-variant bg-surface/50 p-sm">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
              {
                RESERVATION_DETAIL_SCREEN.SPLIT
                  .ORIGINAL_DEPARTURE
              }
            </span>
            <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
              {Math.max(remainingPeopleCount, 0)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 p-sm">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
              {
                RESERVATION_DETAIL_SCREEN.SPLIT
                  .NEW_DEPARTURE
              }
            </span>
            <input
              type={INPUT_TYPES.NUMBER}
              min={
                RESERVATION_NUMBERS.MIN_SPLIT_PEOPLE_COUNT
              }
              max={reservation.peopleCount}
              value={newPeopleCount}
              disabled={isBusy}
              onChange={(event) =>
                handleNewPeopleCountChange(
                  event.target.value
                )
              }
              className="w-16 rounded-lg border border-primary/30 bg-transparent text-center font-headline-lg-mobile text-headline-lg-mobile text-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-sm">
          <h3 className="font-title-md text-title-md text-on-surface">
            {
              RESERVATION_DETAIL_SCREEN.SPLIT
                .EQUIPMENT_TITLE
            }
          </h3>
          {isLoadingItems ? (
            <Spinner size={SPINNER_SIZE.SMALL} />
          ) : (
            items.map((item) => (
              <ReservationSplitItemRow
                key={item.itemId}
                isBusy={isBusy}
                item={item}
                onMovingQuantityChange={
                  handleMovingQuantityChange
                }
              />
            ))
          )}
        </div>

        <p className="rounded-lg border border-primary/20 bg-primary/10 p-sm font-body-base text-[14px] leading-tight text-on-surface">
          {RESERVATION_DETAIL_SCREEN.SPLIT.INFO_NOTICE}
        </p>

        {error && (
          <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
            {error}
          </p>
        )}

        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          disabled={isBusy || isLoadingItems}
          onClick={handleSubmit}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <Spinner size={SPINNER_SIZE.SMALL} />
          ) : (
            RESERVATION_DETAIL_SCREEN.SPLIT.SUBMIT
          )}
        </Button>
      </div>
    </ActionSheet>
  );
};

export default ReservationSplitModal;
