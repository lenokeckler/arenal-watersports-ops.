"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PATHS,
  STRING,
  UNIT_CORRECTION_SCREEN,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { parseReadingValue } from "@/app/utils/reservas/equipmentReadingFields";
import {
  applyUnitCorrection,
  hasSomethingToCorrect,
  type UnitCorrection,
} from "@/app/utils/operaciones/unitCorrection";
import type { MachineCorrectionProps } from "../models/MachineCorrectionProps.interface";
import type {
  MachineCorrectionFormValues,
  MachineCorrectionViewModel,
} from "../models/MachineCorrectionViewModel.interface";

const INITIAL_VALUES: MachineCorrectionFormValues = {
  fuelLevel: STRING.Empty,
  fuelMax: STRING.Empty,
  impactCount: STRING.Empty,
  status: null,
  usageTotal: STRING.Empty,
};

const toCorrection = (
  values: MachineCorrectionFormValues,
  unitId: string,
  workerId: string
): UnitCorrection => ({
  fuelLevel: parseReadingValue(values.fuelLevel),
  fuelMax: parseReadingValue(values.fuelMax),
  impactCount: parseReadingValue(values.impactCount),
  status: values.status,
  unitId,
  usageTotal: parseReadingValue(values.usageTotal),
  workerId,
});

/**
 * US-OPE-020: the form starts empty rather than pre-filled with the
 * current readings, so leaving a box alone can only mean "no lo toqués".
 * Pre-filling would make every save rewrite all four values and quietly
 * turn a fuel correction into a hours correction too.
 */
export const useMachineCorrectionViewModel = ({
  machine,
  workerId,
}: MachineCorrectionProps): MachineCorrectionViewModel => {
  const router = useRouter();
  const [values, setValues] =
    useState<MachineCorrectionFormValues>(INITIAL_VALUES);
  const [error, setError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleFieldChange = <
    Field extends keyof MachineCorrectionFormValues,
  >(
    field: Field,
    value: MachineCorrectionFormValues[Field]
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (): void => {
    const correction = toCorrection(
      values,
      machine.id,
      workerId
    );

    if (!hasSomethingToCorrect(correction)) {
      setError(
        UNIT_CORRECTION_SCREEN.ERROR.NOTHING_TO_CORRECT
      );
      return;
    }

    setIsBusy(true);
    setError(null);

    void applyUnitCorrection(
      createBrowserSupabaseClient(),
      correction
    )
      .then(() =>
        router.push(
          PATHS.OPERATIONS.MACHINE_DETAIL(machine.id)
        )
      )
      .catch(() => {
        setIsBusy(false);
        setError(UNIT_CORRECTION_SCREEN.ERROR.GENERIC);
      });
  };

  return {
    error,
    handleFieldChange,
    handleSubmit,
    isBusy,
    values,
  };
};
