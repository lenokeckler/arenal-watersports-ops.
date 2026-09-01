import type { JSX } from "react";
import {
  DURATION_FIELD_SCREEN,
  DURATION_PRESET_LABEL,
  DURATION_PRESET_ORDER,
  INPUT_TYPES,
} from "@/app/constants";
import FormField from "@/app/components/form-field/FormField";
import { useDurationFieldViewModel } from "./hooks/useDurationFieldViewModel";
import type { DurationFieldProps } from "./models/DurationFieldProps.interface";

const FIELD_CLASS =
  "w-full !rounded-lg !border !border-outline-variant !bg-surface-container-low !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-primary focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-primary/20";

const FIELD_ERROR_CLASS =
  "w-full !rounded-lg !border !border-error/50 !bg-surface-container-low !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-error focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-error/20";

/**
 * US-RES-004/US-OPE-006: duration picked in hours, the way rentals are
 * actually talked about in Costa Rica — 30m/1h/1.5h/2h/3h buttons, with a
 * free-form minutes field kept alongside for the rare case that falls
 * outside them. `reservations.duration_minutes` stays the stored unit;
 * this only changes how a worker sets it.
 */
const DurationField = ({
  error,
  id,
  isDisabled,
  label,
  name,
  onChangeMinutes,
  showErrorText = false,
  valueMinutes,
}: DurationFieldProps): JSX.Element => {
  const {
    handlePresetSelect,
    handleRawMinutesChange,
    rawMinutesValue,
    readableLabel,
    selectedPreset,
  } = useDurationFieldViewModel({
    onChangeMinutes,
    valueMinutes,
  });

  return (
    <div className="flex flex-col gap-xs">
      <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
        {label}
      </span>

      <div className="flex flex-wrap gap-xs">
        {DURATION_PRESET_ORDER.map((preset) => {
          const isSelected = selectedPreset === preset;
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={isSelected}
              disabled={isDisabled}
              onClick={() => handlePresetSelect(preset)}
              className={`min-h-12 min-w-12 rounded-lg border px-sm font-button text-button transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isSelected
                  ? "border-primary bg-primary-container/20 text-primary"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-primary"
              }`}
            >
              {DURATION_PRESET_LABEL[preset]}
            </button>
          );
        })}
      </div>

      <FormField
        id={id}
        name={name}
        label={DURATION_FIELD_SCREEN.CUSTOM_LABEL}
        type={INPUT_TYPES.NUMBER}
        value={rawMinutesValue}
        onChange={(event) =>
          handleRawMinutesChange(event.target.value)
        }
        error={error ?? undefined}
        showErrorText={showErrorText}
        disabled={isDisabled}
        classNameField={
          error ? FIELD_ERROR_CLASS : FIELD_CLASS
        }
      />

      <span className="font-body-base text-body-base text-on-surface-variant">
        {DURATION_FIELD_SCREEN.SELECTED_LABEL(
          readableLabel
        )}
      </span>
    </div>
  );
};

export default DurationField;
