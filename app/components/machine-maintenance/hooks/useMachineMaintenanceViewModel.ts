"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MAINTENANCE_RECORD_SCREEN } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { createMaintenanceRecord } from "@/app/utils/operaciones/maintenanceRecords";
import {
  buildInitialMaintenanceValues,
  buildMaintenanceRecordInput,
  validateMaintenanceForm,
  type MaintenanceFormFields,
} from "@/app/utils/operaciones/maintenanceFormValues";
import type { MachineMaintenanceProps } from "../models/MachineMaintenanceProps.interface";
import type { MachineMaintenanceViewModel } from "../models/MachineMaintenanceViewModel.interface";

const ISO_DATE_LENGTH = 10;

const todayAsIsoDate = (): string =>
  new Date().toISOString().slice(0, ISO_DATE_LENGTH);

/**
 * US-OPE-018: one job, its date, who did it and what it cost. The cost is
 * the single amount operaciones does handle — `maintenance_select` is open
 * to any authenticated worker precisely because this is the machine's own
 * expense, not a customer's money (RNF-038 stands untouched).
 */
export const useMachineMaintenanceViewModel = ({
  unitId,
  workerId,
}: MachineMaintenanceProps): MachineMaintenanceViewModel => {
  const router = useRouter();
  const [values, setValues] =
    useState<MaintenanceFormFields>(() =>
      buildInitialMaintenanceValues(todayAsIsoDate())
    );
  const [error, setError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleFieldChange = <
    Field extends keyof MaintenanceFormFields,
  >(
    field: Field,
    value: MaintenanceFormFields[Field]
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (): void => {
    const validationError = validateMaintenanceForm(values);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsBusy(true);
    setError(null);

    void createMaintenanceRecord(
      createBrowserSupabaseClient(),
      buildMaintenanceRecordInput(values, unitId, workerId)
    )
      .then(() => {
        setValues(
          buildInitialMaintenanceValues(todayAsIsoDate())
        );
        setIsBusy(false);
        router.refresh();
      })
      .catch(() => {
        setIsBusy(false);
        setError(MAINTENANCE_RECORD_SCREEN.ERROR.GENERIC);
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
