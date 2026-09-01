"use client";

import type { JSX } from "react";
import {
  CATEGORY_DETAIL_SCREEN,
  EQUIPMENT_UNIT_STATUS,
  MATERIAL_ICON_NAME,
  PATHS,
  TRACKING_MODE,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import DispatchModal from "@/app/components/pending-dispatch/modals/dispatch/DispatchModal";
import UnitCard from "./components/UnitCard";
import QuantityTiles from "./components/QuantityTiles";
import UnitDispatchBar from "./modals/unit-dispatch/UnitDispatchBar";
import UnitDispatchReservationPicker from "./modals/unit-dispatch/UnitDispatchReservationPicker";
import { useCategoryDetailViewModel } from "./hooks/useCategoryDetailViewModel";
import type { CategoryDetailProps } from "./models/CategoryDetailProps.interface";

const EMPTY_LENGTH = 0;

/**
 * `/tablero/categoria/[categoryId]` (US-TAB-002, US-TAB-003). Presentation
 * only; `useCategoryDetailViewModel` owns the realtime subscription and,
 * composed inside it, the unit-dispatch flow (US-OPE-002, tablero entry):
 * `canDispatch` alone decides whether a unit becomes a tap target, so
 * reservas and administración (outside operaciones mode) see the exact
 * same read-only board this screen has always been.
 */
const CategoryDetail = (
  props: CategoryDetailProps
): JSX.Element => {
  const { workerId } = props;
  const {
    candidateReservations,
    canDispatch,
    detail,
    handleCancelSelection,
    handleCloseDispatchModal,
    handleDispatched,
    handleOpenPicker,
    handleSelectReservation,
    handleToggleUnit,
    isLoadingCandidates,
    isPickerOpen,
    now,
    selectedReservationId,
    selectedUnitIds,
  } = useCategoryDetailViewModel(props);
  const units = detail.units ?? [];

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <Link
        href={PATHS.COMMON.DASHBOARD}
        className="mb-md inline-flex min-h-12 items-center gap-1 text-on-surface-variant transition-colors hover:text-primary"
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.ARROW_BACK}
        />
        {CATEGORY_DETAIL_SCREEN.BACK_TO_BOARD}
      </Link>

      <header className="mx-auto mb-lg max-w-6xl">
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {detail.name}
        </h1>
      </header>

      <main className="mx-auto max-w-6xl">
        {detail.trackingMode ===
          TRACKING_MODE.BY_QUANTITY && detail.stock ? (
          <QuantityTiles stock={detail.stock} />
        ) : units.length === EMPTY_LENGTH ? (
          <p className="font-body-base text-body-base text-on-surface-variant">
            {CATEGORY_DETAIL_SCREEN.EMPTY_UNITS}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-sm sm:gap-md lg:grid-cols-3 xl:grid-cols-4">
            {units.map((unit) => (
              <UnitCard
                key={unit.id}
                isSelectable={
                  canDispatch &&
                  unit.effectiveStatus ===
                    EQUIPMENT_UNIT_STATUS.AVAILABLE
                }
                isSelected={selectedUnitIds.includes(
                  unit.id
                )}
                now={now}
                onToggleSelect={handleToggleUnit}
                unit={unit}
              />
            ))}
          </div>
        )}
      </main>

      {selectedUnitIds.length > EMPTY_LENGTH && (
        <UnitDispatchBar
          onCancel={handleCancelSelection}
          onDispatch={handleOpenPicker}
          selectedCount={selectedUnitIds.length}
        />
      )}

      {isPickerOpen && (
        <UnitDispatchReservationPicker
          isLoading={isLoadingCandidates}
          onClose={handleCancelSelection}
          onSelect={handleSelectReservation}
          reservations={candidateReservations}
        />
      )}

      {selectedReservationId && (
        <DispatchModal
          onClose={handleCloseDispatchModal}
          onDispatched={handleDispatched}
          reservationId={selectedReservationId}
          workerId={workerId}
        />
      )}
    </div>
  );
};

export default CategoryDetail;
