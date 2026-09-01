import {
  DURATION_PRESET_LABEL,
  DURATION_PRESET_ORDER,
  type DurationPreset,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import { formatDurationLabel } from "@/app/utils/reservas/durationLabel";
import type { DurationFieldViewModel } from "../models/DurationFieldViewModel.interface";

interface UseDurationFieldViewModelParams {
  onChangeMinutes: (minutes: number) => void;
  valueMinutes: number;
}

/**
 * US-RES-004/US-OPE-006: keeps the preset buttons, the free-form "casos
 * raros" field and the readable caption all reading the same
 * `valueMinutes` the caller owns — this component holds no state of its
 * own, so a reservation's duration always has exactly one source of truth.
 */
export const useDurationFieldViewModel = ({
  onChangeMinutes,
  valueMinutes,
}: UseDurationFieldViewModelParams): DurationFieldViewModel => {
  const selectedPreset: Nullable<DurationPreset> =
    DURATION_PRESET_ORDER.find(
      (preset) => preset === valueMinutes
    ) ?? null;

  const handlePresetSelect = (
    preset: DurationPreset
  ): void => {
    onChangeMinutes(preset);
  };

  const handleRawMinutesChange = (
    rawValue: string
  ): void => {
    onChangeMinutes(Number(rawValue));
  };

  const hasValidValue =
    Number.isFinite(valueMinutes) && valueMinutes > 0;

  return {
    handlePresetSelect,
    handleRawMinutesChange,
    rawMinutesValue: hasValidValue
      ? String(valueMinutes)
      : "",
    readableLabel: selectedPreset
      ? DURATION_PRESET_LABEL[selectedPreset]
      : formatDurationLabel(valueMinutes),
    selectedPreset,
  };
};
