"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  INPUT_TYPES,
  MAINTENANCE_RECORD_SCREEN,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import type { MachineMaintenanceViewModel } from "../models/MachineMaintenanceViewModel.interface";
import MaintenanceCostFields from "./MaintenanceCostFields";
import MaintenanceOilThresholdField from "./MaintenanceOilThresholdField";
import MaintenanceWorkTypePicker from "./MaintenanceWorkTypePicker";

interface MaintenanceRecordFormProps extends MachineMaintenanceViewModel {
  hasMotor: boolean;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const LABEL_CLASS =
  "font-label-mono text-label-mono uppercase text-on-surface-variant";

/**
 * US-OPE-018. The oil-change threshold only appears for a motorized unit,
 * and only because without moving it the US-OPE-012 alert that sent the
 * machine to the workshop would keep firing forever.
 */
const MaintenanceRecordForm = ({
  error,
  handleFieldChange,
  handleSubmit,
  hasMotor,
  isBusy,
  values,
}: MaintenanceRecordFormProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {MAINTENANCE_RECORD_SCREEN.FORM.TITLE}
    </h2>

    <MaintenanceWorkTypePicker
      isBusy={isBusy}
      onOtherWorkTypeChange={(value) =>
        handleFieldChange("otherWorkType", value)
      }
      onWorkTypeChange={(value) =>
        handleFieldChange("workType", value)
      }
      otherWorkType={values.otherWorkType}
      workType={values.workType}
    />

    <label className="flex flex-col gap-1">
      <span className={LABEL_CLASS}>
        {MAINTENANCE_RECORD_SCREEN.FORM.DATE_LABEL}
      </span>
      <input
        type={INPUT_TYPES.DATE}
        value={values.performedAt}
        disabled={isBusy}
        onChange={(event) =>
          handleFieldChange(
            "performedAt",
            event.target.value
          )
        }
        className={FIELD_CLASS}
      />
    </label>

    <label className="flex flex-col gap-1">
      <span className={LABEL_CLASS}>
        {MAINTENANCE_RECORD_SCREEN.FORM.DESCRIPTION_LABEL}
      </span>
      <textarea
        rows={3}
        value={values.description}
        disabled={isBusy}
        placeholder={
          MAINTENANCE_RECORD_SCREEN.FORM
            .DESCRIPTION_PLACEHOLDER
        }
        onChange={(event) =>
          handleFieldChange(
            "description",
            event.target.value
          )
        }
        className={FIELD_CLASS}
      />
    </label>

    <MaintenanceCostFields
      costAmount={values.costAmount}
      costCurrency={values.costCurrency}
      isBusy={isBusy}
      isExternal={values.isExternal}
      onCostAmountChange={(value) =>
        handleFieldChange("costAmount", value)
      }
      onCostCurrencyChange={(value) =>
        handleFieldChange("costCurrency", value)
      }
      onExternalToggle={() =>
        handleFieldChange("isExternal", !values.isExternal)
      }
    />

    {hasMotor && (
      <MaintenanceOilThresholdField
        isBusy={isBusy}
        onChange={(value) =>
          handleFieldChange("nextOilChangeAt", value)
        }
        value={values.nextOilChangeAt}
      />
    )}

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
        MAINTENANCE_RECORD_SCREEN.FORM.SUBMIT
      )}
    </Button>
  </section>
);

export default MaintenanceRecordForm;
