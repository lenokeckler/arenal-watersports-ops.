"use client";

import type { JSX } from "react";
import { RESERVATION_DETAIL_MODAL } from "@/app/constants";
import ReservationDetailHeader from "./components/ReservationDetailHeader";
import ReservationDetailMeta from "./components/ReservationDetailMeta";
import ReservationDetailEquipment from "./components/ReservationDetailEquipment";
import ReservationDetailGuides from "./components/ReservationDetailGuides";
import ReservationDetailPayment from "./components/ReservationDetailPayment";
import ReservationDetailActions from "./components/ReservationDetailActions";
import ReservationEditModal from "./modals/edit/ReservationEditModal";
import ReservationSplitModal from "./modals/split/ReservationSplitModal";
import ReservationPostponeModal from "./modals/postpone/ReservationPostponeModal";
import ReservationCancelModal from "./modals/cancel/ReservationCancelModal";
import { useReservationDetailViewModel } from "./hooks/useReservationDetailViewModel";
import type { ReservationDetailProps } from "./models/ReservationDetailProps.interface";

/**
 * `/reservas/detalle/[reservationId]` (US-RES-003, US-RES-018 through
 * US-RES-022). Every field the read-only sections show still arrives
 * resolved from `fetchReservationDetail` — this is a client component only
 * because the four action sheets below need their own open/close state and
 * browser-side writes.
 */
const ReservationDetail = ({
  canSeeMoney,
  reservation,
  workerId,
}: ReservationDetailProps): JSX.Element => {
  const {
    activeModal,
    canCancel,
    canEdit,
    canPostpone,
    canSplit,
    handleActionComplete,
    handleCloseModal,
    handleOpenCancel,
    handleOpenEdit,
    handleOpenPostpone,
    handleOpenSplit,
  } = useReservationDetailViewModel(reservation);

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-32 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <ReservationDetailHeader reservation={reservation} />

      <main className="mx-auto flex max-w-3xl flex-col gap-md">
        <ReservationDetailMeta reservation={reservation} />
        <ReservationDetailEquipment
          items={reservation.items}
        />
        <ReservationDetailGuides
          guideNames={reservation.guideNames}
        />
        {canSeeMoney && (
          <ReservationDetailPayment
            reservation={reservation}
          />
        )}
      </main>

      <ReservationDetailActions
        canCancel={canCancel}
        canEdit={canEdit}
        canPostpone={canPostpone}
        canSplit={canSplit}
        onCancel={handleOpenCancel}
        onEdit={handleOpenEdit}
        onPostpone={handleOpenPostpone}
        onSplit={handleOpenSplit}
      />

      {activeModal === RESERVATION_DETAIL_MODAL.EDIT && (
        <ReservationEditModal
          onClose={handleCloseModal}
          onSaved={handleActionComplete}
          reservation={reservation}
          workerId={workerId}
        />
      )}
      {activeModal === RESERVATION_DETAIL_MODAL.SPLIT && (
        <ReservationSplitModal
          onClose={handleCloseModal}
          onSplit={handleActionComplete}
          reservation={reservation}
          workerId={workerId}
        />
      )}
      {activeModal ===
        RESERVATION_DETAIL_MODAL.POSTPONE && (
        <ReservationPostponeModal
          onClose={handleCloseModal}
          onPostponed={handleActionComplete}
          reservationId={reservation.id}
          startsAt={reservation.startsAt}
          status={reservation.status}
          workerId={workerId}
        />
      )}
      {activeModal === RESERVATION_DETAIL_MODAL.CANCEL && (
        <ReservationCancelModal
          onCancelled={handleActionComplete}
          onClose={handleCloseModal}
          reservationId={reservation.id}
          status={reservation.status}
          workerId={workerId}
        />
      )}
    </div>
  );
};

export default ReservationDetail;
