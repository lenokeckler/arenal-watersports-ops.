"use client";

import type { JSX } from "react";
import {
  DISPATCH_BOARD_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import DispatchBoardCard from "./components/DispatchBoardCard";
import AdjustDurationModal from "./modals/adjust-duration/AdjustDurationModal";
import { useDispatchBoardViewModel } from "./hooks/useDispatchBoardViewModel";
import type { DispatchBoardProps } from "./models/DispatchBoardProps.interface";

/**
 * `/operaciones` (US-OPE-004, US-OPE-005, US-OPE-006, US-OPE-008) — the
 * bottom nav's "Ops" landing screen. Presentation only;
 * `useDispatchBoardViewModel` owns the ticking clock, the realtime refetch
 * and the adjust-duration sheet's state (`component-architecture`).
 */
const DispatchBoard = ({
  initialReservations,
  workerId,
}: DispatchBoardProps): JSX.Element => {
  const {
    handleCloseModal,
    handleDurationAdjusted,
    handleOpenAdjust,
    isEmpty,
    now,
    reservations,
    selectedReservation,
  } = useDispatchBoardViewModel({
    initialReservations,
    workerId,
  });

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <header className="mx-auto mb-lg flex max-w-3xl flex-col gap-1">
        <div className="flex items-end justify-between gap-sm">
          <div>
            <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
              {DISPATCH_BOARD_SCREEN.TITLE}
            </h1>
            <p className="font-body-base text-body-base text-on-surface-variant">
              {DISPATCH_BOARD_SCREEN.SUBTITLE}
            </p>
          </div>
          <Link
            href={PATHS.OPERATIONS.DISPATCH}
            className="flex min-h-10 items-center gap-1 text-primary"
          >
            {DISPATCH_BOARD_SCREEN.DISPATCH_LINK}
            <MaterialIcon
              name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
              className="!text-[16px]"
            />
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-3xl grid-cols-1 gap-sm">
        {isEmpty ? (
          <p className="font-body-base text-body-base text-on-surface-variant">
            {DISPATCH_BOARD_SCREEN.EMPTY}
          </p>
        ) : (
          reservations.map((reservation) => (
            <DispatchBoardCard
              key={reservation.id}
              now={now}
              onAdjust={handleOpenAdjust}
              reservation={reservation}
            />
          ))
        )}
      </main>

      {selectedReservation && (
        <AdjustDurationModal
          currentExtraTimeMinutes={
            selectedReservation.extraTimeMinutes
          }
          onAdjusted={handleDurationAdjusted}
          onClose={handleCloseModal}
          previousDurationMinutes={
            selectedReservation.durationMinutes
          }
          reservationId={selectedReservation.id}
          workerId={workerId}
        />
      )}
    </div>
  );
};

export default DispatchBoard;
