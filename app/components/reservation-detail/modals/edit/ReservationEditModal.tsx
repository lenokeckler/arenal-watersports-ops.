"use client";

import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  RESERVATION_DETAIL_SCREEN,
  SPINNER_SIZE,
} from "@/app/constants";
import Spinner from "@/app/components/spinner/Spinner";
import type { ReservationDetail } from "@/app/utils/reservas/reservationDetail";
import ActionSheet from "@/app/components/action-sheet/ActionSheet";
import { useReservationEditModalCatalog } from "./hooks/useReservationEditModalCatalog";
import ReservationEditModalForm from "./ReservationEditModalForm";

interface ReservationEditModalProps {
  onClose: () => void;
  onSaved: () => void;
  reservation: ReservationDetail;
  workerId: string;
}

/**
 * US-RES-018: gates on `useReservationEditModalCatalog` before mounting
 * `ReservationEditModalForm` — its `useState` initializers need the
 * reservation's current items and the reservable catalog to already be
 * there on the form's first render, not arriving after via a `useEffect`.
 */
const ReservationEditModal = ({
  onClose,
  onSaved,
  reservation,
  workerId,
}: ReservationEditModalProps): JSX.Element => {
  const {
    candidateUnits,
    categories,
    isLoading,
    originalItems,
  } = useReservationEditModalCatalog(reservation.id);

  return (
    <ActionSheet
      icon={MATERIAL_ICON_NAME.EDIT_CALENDAR}
      onClose={onClose}
      title={RESERVATION_DETAIL_SCREEN.EDIT.TITLE}
    >
      {isLoading ? (
        <div className="flex justify-center py-lg">
          <Spinner size={SPINNER_SIZE.MEDIUM} />
        </div>
      ) : (
        <ReservationEditModalForm
          candidateUnits={candidateUnits}
          categories={categories}
          onSaved={onSaved}
          originalItems={originalItems}
          reservation={reservation}
          workerId={workerId}
        />
      )}
    </ActionSheet>
  );
};

export default ReservationEditModal;
