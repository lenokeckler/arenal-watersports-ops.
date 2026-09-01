"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  DISPATCH_BOARD_SCREEN,
  FIELD_IDS,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
} from "@/app/constants";
import ActionSheet from "@/app/components/action-sheet/ActionSheet";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import DurationField from "@/app/components/duration-field/DurationField";
import { useAdjustDurationModalViewModel } from "./hooks/useAdjustDurationModalViewModel";

interface AdjustDurationModalProps {
  currentExtraTimeMinutes: number;
  onAdjusted: () => void;
  onClose: () => void;
  previousDurationMinutes: number;
  reservationId: string;
  workerId: string;
}

/** US-OPE-006: the sheet that changes how long a dispatched reservation still runs. */
const AdjustDurationModal = ({
  currentExtraTimeMinutes,
  onAdjusted,
  onClose,
  previousDurationMinutes,
  reservationId,
  workerId,
}: AdjustDurationModalProps): JSX.Element => {
  const {
    durationMinutes,
    error,
    extendedMinutes,
    handleDurationChange,
    handleSubmit,
    isBusy,
  } = useAdjustDurationModalViewModel({
    currentExtraTimeMinutes,
    onAdjusted,
    previousDurationMinutes,
    reservationId,
    workerId,
  });

  return (
    <ActionSheet
      icon={MATERIAL_ICON_NAME.SCHEDULE}
      onClose={onClose}
      title={DISPATCH_BOARD_SCREEN.ADJUST.TITLE}
    >
      <div className="flex flex-col gap-md">
        <DurationField
          id={FIELD_IDS.DURATION_MINUTES}
          name={FIELD_IDS.DURATION_MINUTES}
          label={DISPATCH_BOARD_SCREEN.ADJUST.MINUTES_LABEL}
          isDisabled={isBusy}
          valueMinutes={durationMinutes}
          onChangeMinutes={handleDurationChange}
        />

        {extendedMinutes > 0 && (
          <p className="rounded-lg border border-primary/20 bg-primary/10 p-sm font-body-base text-[14px] leading-tight text-on-surface">
            {DISPATCH_BOARD_SCREEN.ADJUST.EXTENDED_NOTICE}
          </p>
        )}

        {error && (
          <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
            {error}
          </p>
        )}

        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          disabled={isBusy}
          onClick={handleSubmit}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <Spinner size={SPINNER_SIZE.SMALL} />
          ) : (
            DISPATCH_BOARD_SCREEN.ADJUST.SUBMIT
          )}
        </Button>
      </div>
    </ActionSheet>
  );
};

export default AdjustDurationModal;
