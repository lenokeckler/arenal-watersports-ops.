"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  DISPATCH_SCREEN,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
} from "@/app/constants";
import ActionSheet from "@/app/components/action-sheet/ActionSheet";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import EquipmentReadingRow from "@/app/components/equipment-reading-row/EquipmentReadingRow";
import { useDispatchModalViewModel } from "./hooks/useDispatchModalViewModel";

interface DispatchModalProps {
  onClose: () => void;
  onDispatched: () => void;
  reservationId: string;
  workerId: string;
}

/** US-OPE-002/US-OPE-003: confirms a dispatch and records the departure reading. */
const DispatchModal = ({
  onClose,
  onDispatched,
  reservationId,
  workerId,
}: DispatchModalProps): JSX.Element => {
  const {
    error,
    handleFuelChange,
    handleSubmit,
    handleUsageChange,
    isBusy,
    isLoadingReadings,
    readings,
  } = useDispatchModalViewModel({
    onDispatched,
    reservationId,
    workerId,
  });

  return (
    <ActionSheet
      icon={MATERIAL_ICON_NAME.SAILING}
      onClose={onClose}
      title={DISPATCH_SCREEN.MODAL_TITLE}
    >
      <div className="flex flex-col gap-md">
        {isLoadingReadings ? (
          <Spinner size={SPINNER_SIZE.SMALL} />
        ) : (
          readings.map((reading) => (
            <EquipmentReadingRow
              key={reading.itemId}
              fuelLabel={DISPATCH_SCREEN.FUEL_LABEL}
              isDisabled={isBusy}
              onFuelChange={handleFuelChange}
              onUsageChange={handleUsageChange}
              reading={reading}
              usageLabel={DISPATCH_SCREEN.USAGE_LABEL}
            />
          ))
        )}

        {error && (
          <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
            {error}
          </p>
        )}

        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          disabled={isBusy || isLoadingReadings}
          onClick={handleSubmit}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <Spinner size={SPINNER_SIZE.SMALL} />
          ) : (
            DISPATCH_SCREEN.CONFIRM_SUBMIT
          )}
        </Button>
      </div>
    </ActionSheet>
  );
};

export default DispatchModal;
