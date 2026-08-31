"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  DAMAGE_REPORTS_SCREEN,
  INPUT_TYPES,
  OPERATIONS_NUMBERS,
  SPINNER_SIZE,
  type DamageCause,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import type { MachineDamageViewModel } from "../models/MachineDamageViewModel.interface";
import DamageCausePicker from "./DamageCausePicker";

type MachineDamageFormProps = Omit<
  MachineDamageViewModel,
  "handleCauseChange"
> & {
  onCauseChange: (cause: DamageCause) => void;
};

const FIELD_CLASS =
  "w-full rounded-lg border border-white/10 bg-surface-container-low p-sm text-on-surface placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const LABEL_CLASS =
  "font-label-mono text-label-mono uppercase text-on-surface-variant";

/**
 * US-OPE-013: cause, description and how much the impact count went up.
 * The report is signed by whoever is filling it in — the ViewModel passes
 * the session's own worker id, never a picked name.
 */
const MachineDamageForm = ({
  error,
  handleDescriptionChange,
  handleImpactDeltaChange,
  handleSubmit,
  handleToggleOutOfService,
  isBusy,
  onCauseChange,
  values,
}: MachineDamageFormProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {DAMAGE_REPORTS_SCREEN.FORM.TITLE}
    </h2>

    <DamageCausePicker
      isBusy={isBusy}
      onCauseChange={onCauseChange}
      selectedCause={values.cause}
    />

    <label className="flex flex-col gap-1">
      <span className={LABEL_CLASS}>
        {DAMAGE_REPORTS_SCREEN.FORM.DESCRIPTION_LABEL}
      </span>
      <textarea
        rows={3}
        value={values.description}
        disabled={isBusy}
        placeholder={
          DAMAGE_REPORTS_SCREEN.FORM.DESCRIPTION_PLACEHOLDER
        }
        onChange={(event) =>
          handleDescriptionChange(event.target.value)
        }
        className={FIELD_CLASS}
      />
    </label>

    <label className="flex flex-col gap-1">
      <span className={LABEL_CLASS}>
        {DAMAGE_REPORTS_SCREEN.FORM.IMPACT_LABEL}
      </span>
      <input
        type={INPUT_TYPES.NUMBER}
        min={OPERATIONS_NUMBERS.IMPACT_DELTA_MIN}
        value={values.impactDelta}
        disabled={isBusy}
        onChange={(event) =>
          handleImpactDeltaChange(event.target.value)
        }
        className={FIELD_CLASS}
      />
    </label>

    <label className="flex min-h-12 items-center gap-sm">
      <input
        type={INPUT_TYPES.CHECKBOX}
        checked={values.takeOutOfService}
        disabled={isBusy}
        onChange={handleToggleOutOfService}
        className="h-6 w-6 accent-primary"
      />
      <span className="font-body-base text-body-base text-on-surface">
        {DAMAGE_REPORTS_SCREEN.FORM.OUT_OF_SERVICE_LABEL}
      </span>
    </label>

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
        DAMAGE_REPORTS_SCREEN.FORM.SUBMIT
      )}
    </Button>
  </section>
);

export default MachineDamageForm;
