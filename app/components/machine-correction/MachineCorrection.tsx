"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  MACHINE_DETAIL_SCREEN,
  PATHS,
  SPINNER_SIZE,
  UNIT_CORRECTION_SCREEN,
  USAGE_METRIC_LABEL,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";
import { parseReadingValue } from "@/app/utils/reservas/equipmentReadingFields";
import MachineCorrectionField from "./components/MachineCorrectionField";
import MachineCorrectionFuelField from "./components/MachineCorrectionFuelField";
import MachineCorrectionStatusPicker from "./components/MachineCorrectionStatusPicker";
import { useMachineCorrectionViewModel } from "./hooks/useMachineCorrectionViewModel";
import type { MachineCorrectionProps } from "./models/MachineCorrectionProps.interface";

/**
 * `/operaciones/maquinas/[unitId]/correccion` (US-OPE-020): somebody
 * filled the tank, changed the oil or found a scratch with no reservation
 * in the middle. Signed by whoever did it through `updated_by`.
 */
const MachineCorrection = ({
  machine,
  workerId,
}: MachineCorrectionProps): JSX.Element => {
  const {
    error,
    handleFieldChange,
    handleSubmit,
    isBusy,
    values,
  } = useMachineCorrectionViewModel({
    machine,
    workerId,
  });

  return (
    <OperationsScreenShell
      backHref={PATHS.OPERATIONS.MACHINE_DETAIL(machine.id)}
      backLabel={MACHINE_DETAIL_SCREEN.BACK}
      subtitle={UNIT_CORRECTION_SCREEN.SUBTITLE}
      title={`${UNIT_CORRECTION_SCREEN.TITLE} · ${machine.code}`}
    >
      <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md">
        {machine.consumesFuel && (
          <MachineCorrectionFuelField
            currentFuelLevel={machine.fuelLevel}
            fuelMax={machine.fuelMax}
            isBusy={isBusy}
            onSelect={(level) =>
              handleFieldChange("fuelLevel", String(level))
            }
            selectedLevel={parseReadingValue(
              values.fuelLevel
            )}
          />
        )}

        {machine.consumesFuel && (
          <MachineCorrectionField
            currentValue={String(machine.fuelMax)}
            isBusy={isBusy}
            label={
              UNIT_CORRECTION_SCREEN.FORM.FUEL_MAX_LABEL
            }
            onChange={(value) =>
              handleFieldChange("fuelMax", value)
            }
            value={values.fuelMax}
          />
        )}

        {machine.hasMotor && machine.usageMetric && (
          <MachineCorrectionField
            currentValue={String(machine.usageTotal)}
            isBusy={isBusy}
            label={`${UNIT_CORRECTION_SCREEN.FORM.USAGE_LABEL} · ${
              USAGE_METRIC_LABEL[machine.usageMetric]
            }`}
            onChange={(value) =>
              handleFieldChange("usageTotal", value)
            }
            value={values.usageTotal}
          />
        )}

        <MachineCorrectionField
          currentValue={String(machine.impactCount)}
          isBusy={isBusy}
          label={UNIT_CORRECTION_SCREEN.FORM.IMPACTS_LABEL}
          onChange={(value) =>
            handleFieldChange("impactCount", value)
          }
          value={values.impactCount}
        />

        <MachineCorrectionStatusPicker
          currentStatus={machine.status}
          isBusy={isBusy}
          onStatusChange={(status) =>
            handleFieldChange("status", status)
          }
          selectedStatus={values.status}
        />

        <p className="font-label-mono text-label-mono text-outline">
          {UNIT_CORRECTION_SCREEN.SIGNATURE_NOTICE}
        </p>

        {error && (
          <p className="font-label-mono text-label-mono text-error">
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
            UNIT_CORRECTION_SCREEN.FORM.SUBMIT
          )}
        </Button>
      </section>
    </OperationsScreenShell>
  );
};

export default MachineCorrection;
