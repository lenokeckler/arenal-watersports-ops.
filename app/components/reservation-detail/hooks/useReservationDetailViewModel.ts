"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RESERVATION_DETAIL_MODAL,
  RESERVATION_STATUS,
  type ReservationDetailModal,
} from "@/app/constants";
import type { ReservationDetail } from "@/app/utils/reservas/reservationDetail";
import type { ReservationDetailViewModel } from "../models/ReservationDetailViewModel.interface";

/**
 * US-RES-018 through US-RES-022: which action sheet is open, and which
 * actions the current status allows. A reservation only offers editing,
 * splitting and cancelling while it is still `scheduled` or `dispatched` —
 * a `closed` or `cancelled` one is history (US-RES-021's own criterion),
 * and postponing a `dispatched` reservation is the one action the story
 * still allows past `scheduled` (US-RES-020, weather only).
 */
export const useReservationDetailViewModel = (
  reservation: ReservationDetail
): ReservationDetailViewModel => {
  const router = useRouter();
  const [activeModal, setActiveModal] =
    useState<ReservationDetailModal>(
      RESERVATION_DETAIL_MODAL.NONE
    );

  const isScheduled =
    reservation.status === RESERVATION_STATUS.SCHEDULED;
  const isDispatched =
    reservation.status === RESERVATION_STATUS.DISPATCHED;

  const handleCloseModal = (): void => {
    setActiveModal(RESERVATION_DETAIL_MODAL.NONE);
  };

  const handleActionComplete = (): void => {
    setActiveModal(RESERVATION_DETAIL_MODAL.NONE);
    router.refresh();
  };

  return {
    activeModal,
    canCancel: isScheduled || isDispatched,
    canEdit: isScheduled,
    canPostpone: isScheduled || isDispatched,
    canSplit: isScheduled,
    handleActionComplete,
    handleCloseModal,
    handleOpenCancel: () =>
      setActiveModal(RESERVATION_DETAIL_MODAL.CANCEL),
    handleOpenEdit: () =>
      setActiveModal(RESERVATION_DETAIL_MODAL.EDIT),
    handleOpenPostpone: () =>
      setActiveModal(RESERVATION_DETAIL_MODAL.POSTPONE),
    handleOpenSplit: () =>
      setActiveModal(RESERVATION_DETAIL_MODAL.SPLIT),
  };
};
