"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DAMAGE_REPORTS_SCREEN,
  OPERATIONS_NUMBERS,
  STRING,
  type DamageCause,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { parseReadingValue } from "@/app/utils/reservas/equipmentReadingFields";
import { createStandaloneDamageReport } from "@/app/utils/operaciones/unitDamageReports";
import type { MachineDamageProps } from "../models/MachineDamageProps.interface";
import type {
  MachineDamageFormValues,
  MachineDamageViewModel,
} from "../models/MachineDamageViewModel.interface";

const INITIAL_VALUES: MachineDamageFormValues = {
  cause: null,
  description: STRING.Empty,
  impactDelta: STRING.Empty,
  takeOutOfService: true,
};

const validate = (
  values: MachineDamageFormValues
): Nullable<string> => {
  if (!values.cause) {
    return DAMAGE_REPORTS_SCREEN.ERROR.CAUSE_REQUIRED;
  }

  if (!values.description.trim()) {
    return DAMAGE_REPORTS_SCREEN.ERROR.DESCRIPTION_REQUIRED;
  }

  return null;
};

/**
 * US-OPE-013 raised from the machine's ficha. The impact delta defaults to
 * nothing rather than zero because a blank field means "no subió", and
 * taking the unit out of availability is a separate call the operator
 * makes (US-OPE-017) — it defaults to on because a machine that just got
 * hit usually should not go back out.
 */
export const useMachineDamageViewModel = ({
  impactCount,
  unitId,
  workerId,
}: MachineDamageProps): MachineDamageViewModel => {
  const router = useRouter();
  const [values, setValues] =
    useState<MachineDamageFormValues>(INITIAL_VALUES);
  const [error, setError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const updateValue = <
    Field extends keyof MachineDamageFormValues,
  >(
    field: Field,
    value: MachineDamageFormValues[Field]
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (): void => {
    const validationError = validate(values);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsBusy(true);
    setError(null);

    void createStandaloneDamageReport(
      createBrowserSupabaseClient(),
      {
        cause: values.cause as DamageCause,
        description: values.description.trim(),
        impactDelta:
          parseReadingValue(values.impactDelta) ??
          OPERATIONS_NUMBERS.IMPACT_DELTA_MIN,
        previousImpactCount: impactCount,
        takeOutOfService: values.takeOutOfService,
        unitId,
        workerId,
      }
    )
      .then(() => {
        setValues(INITIAL_VALUES);
        setIsBusy(false);
        router.refresh();
      })
      .catch(() => {
        setIsBusy(false);
        setError(DAMAGE_REPORTS_SCREEN.ERROR.GENERIC);
      });
  };

  return {
    error,
    handleCauseChange: (cause) =>
      updateValue("cause", cause),
    handleDescriptionChange: (description) =>
      updateValue("description", description),
    handleImpactDeltaChange: (impactDelta) =>
      updateValue("impactDelta", impactDelta),
    handleSubmit,
    handleToggleOutOfService: () =>
      updateValue(
        "takeOutOfService",
        !values.takeOutOfService
      ),
    isBusy,
    values,
  };
};
