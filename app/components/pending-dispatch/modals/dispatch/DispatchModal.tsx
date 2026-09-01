"use client";

import type { JSX } from "react";
import {
  DISPATCH_SCREEN,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
} from "@/app/constants";
import ActionSheet from "@/app/components/action-sheet/ActionSheet";
import Spinner from "@/app/components/spinner/Spinner";
import { useDispatchModalCatalogViewModel } from "./hooks/useDispatchModalCatalogViewModel";
import DispatchModalForm from "./DispatchModalForm";

interface DispatchModalProps {
  onClose: () => void;
  onDispatched: () => void;
  /**
   * US-OPE-002 (tablero entry): units already tapped on `CategoryDetail`
   * before opening this sheet from the board — absent when opened from
   * `/operaciones/despacho`'s plain list, where nothing is pre-selected.
   */
  preselectedUnitIds?: string[];
  reservationId: string;
  workerId: string;
}

const NO_PRESELECTED_UNITS: string[] = [];

/**
 * US-OPE-002/US-OPE-003: gates on `useDispatchModalCatalogViewModel` before
 * mounting `DispatchModalForm` — its equipment step needs the reservation's
 * current items and the reservable catalog already there on its first
 * render, same reason `ReservationEditModal` gates the same way.
 */
const DispatchModal = ({
  onClose,
  onDispatched,
  preselectedUnitIds = NO_PRESELECTED_UNITS,
  reservationId,
  workerId,
}: DispatchModalProps): JSX.Element => {
  const { catalog, isLoading } =
    useDispatchModalCatalogViewModel(reservationId);

  return (
    <ActionSheet
      icon={MATERIAL_ICON_NAME.SAILING}
      onClose={onClose}
      title={DISPATCH_SCREEN.MODAL_TITLE}
    >
      {isLoading || !catalog ? (
        <div className="flex justify-center py-lg">
          <Spinner size={SPINNER_SIZE.MEDIUM} />
        </div>
      ) : (
        <DispatchModalForm
          catalog={catalog}
          onDispatched={onDispatched}
          preselectedUnitIds={preselectedUnitIds}
          reservationId={reservationId}
          workerId={workerId}
        />
      )}
    </ActionSheet>
  );
};

export default DispatchModal;
