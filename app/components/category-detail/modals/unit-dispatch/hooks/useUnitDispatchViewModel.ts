"use client";

import { useState } from "react";
import { STORE_SLICES, WORK_AREA } from "@/app/constants";
import { useAppSelector } from "@/app/store/hooks";
import type { Nullable } from "@/app/types";
import type { OperationsReservationSummary } from "@/app/utils/operaciones/dispatchBoard";
import { useUnitDispatchSelection } from "./useUnitDispatchSelection";
import { useUnitDispatchPicker } from "./useUnitDispatchPicker";

interface UseUnitDispatchViewModelParams {
  categoryId: string;
  onDispatched: () => void;
}

export interface UseUnitDispatchViewModelReturn {
  candidateReservations: OperationsReservationSummary[];
  canDispatch: boolean;
  handleCancelSelection: () => void;
  handleCloseDispatchModal: () => void;
  handleDispatched: () => void;
  handleOpenPicker: () => void;
  handleSelectReservation: (reservationId: string) => void;
  handleToggleUnit: (unitId: string) => void;
  isLoadingCandidates: boolean;
  isPickerOpen: boolean;
  selectedReservationId: Nullable<string>;
  selectedUnitIds: string[];
}

/**
 * US-OPE-002 (tablero entry): "Eso es para operaciones" — only the active
 * operaciones mode gets this affordance at all (`activeArea`, the same
 * `workArea` slice `useBottomNavViewModel` reads; never `availableAreas`,
 * so an admin who has not switched into operaciones does not see it
 * either). Coordinates the units tapped on the category, the reservation
 * picker, and which reservation is about to be dispatched — the dispatch
 * sheet itself is `DispatchModal`, reused as-is from `/operaciones/despacho`.
 */
export const useUnitDispatchViewModel = ({
  categoryId,
  onDispatched,
}: UseUnitDispatchViewModelParams): UseUnitDispatchViewModelReturn => {
  const { activeArea } = useAppSelector(
    (state) => state[STORE_SLICES.WORK_AREA]
  );
  const canDispatch = activeArea === WORK_AREA.OPERATIONS;
  const selection = useUnitDispatchSelection();
  const picker = useUnitDispatchPicker(categoryId);
  const [selectedReservationId, setSelectedReservationId] =
    useState<Nullable<string>>(null);
  const handleCancelSelection = (): void => {
    picker.closePicker();
    selection.clearSelection();
  };
  const handleSelectReservation = (
    reservationId: string
  ): void => {
    setSelectedReservationId(reservationId);
    picker.closePicker();
  };
  const handleCloseDispatchModal = (): void => {
    setSelectedReservationId(null);
    picker.openPicker();
  };
  const handleDispatched = (): void => {
    setSelectedReservationId(null);
    selection.clearSelection();
    onDispatched();
  };

  return {
    candidateReservations: picker.candidateReservations,
    canDispatch,
    handleCancelSelection,
    handleCloseDispatchModal,
    handleDispatched,
    handleOpenPicker: picker.openPicker,
    handleSelectReservation,
    handleToggleUnit: selection.handleToggleUnit,
    isLoadingCandidates: picker.isLoadingCandidates,
    isPickerOpen: picker.isPickerOpen,
    selectedReservationId,
    selectedUnitIds: selection.selectedUnitIds,
  };
};
