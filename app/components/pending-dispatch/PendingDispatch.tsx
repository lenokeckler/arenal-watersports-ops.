"use client";

import type { JSX } from "react";
import {
  DISPATCH_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import PendingDispatchCard from "./components/PendingDispatchCard";
import DispatchModal from "./modals/dispatch/DispatchModal";
import { usePendingDispatchViewModel } from "./hooks/usePendingDispatchViewModel";
import type { PendingDispatchProps } from "./models/PendingDispatchProps.interface";

/**
 * `/operaciones/despacho` (US-OPE-001, US-OPE-002, US-OPE-003, US-OPE-008).
 * Presentation only; `usePendingDispatchViewModel` owns the realtime
 * refetch and the dispatch sheet's open/close state
 * (`component-architecture`).
 */
const PendingDispatch = ({
  initialReservations,
  workerId,
}: PendingDispatchProps): JSX.Element => {
  const {
    handleCloseModal,
    handleDispatched,
    handleOpenDispatch,
    isEmpty,
    reservations,
    selectedReservationId,
  } = usePendingDispatchViewModel({
    initialReservations,
    workerId,
  });

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <header className="mx-auto mb-lg flex max-w-3xl items-end justify-between gap-sm">
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {DISPATCH_SCREEN.TITLE}
        </h1>
        <Link
          href={PATHS.OPERATIONS.ROOT}
          className="flex min-h-10 items-center gap-1 text-primary"
        >
          {DISPATCH_SCREEN.BOARD_LINK}
          <MaterialIcon
            name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
            className="!text-[16px]"
          />
        </Link>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-sm">
        {isEmpty ? (
          <p className="font-body-base text-body-base text-on-surface-variant">
            {DISPATCH_SCREEN.EMPTY}
          </p>
        ) : (
          reservations.map((reservation) => (
            <PendingDispatchCard
              key={reservation.id}
              onDispatch={handleOpenDispatch}
              reservation={reservation}
            />
          ))
        )}
      </main>

      {selectedReservationId && (
        <DispatchModal
          onClose={handleCloseModal}
          onDispatched={handleDispatched}
          reservationId={selectedReservationId}
          workerId={workerId}
        />
      )}
    </div>
  );
};

export default PendingDispatch;
