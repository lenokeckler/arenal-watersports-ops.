"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MACHINE_DETAIL_SCREEN,
  UNIT_STATUS,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { updateUnitStatus } from "@/app/utils/operaciones/unitStatus";
import { useConditionPhotoUploadViewModel } from "./useConditionPhotoUploadViewModel";
import type { MachineDetailProps } from "../models/MachineDetailProps.interface";
import type { MachineDetailViewModel } from "../models/MachineDetailViewModel.interface";

/**
 * US-OPE-017: the ficha's only write of its own is the status toggle that
 * takes a machine out of availability and brings it back. Everything the
 * board offers reads `unit_current_state`, which already treats anything
 * other than `available` as unavailable, so this single update is what
 * "sale de la disponibilidad sin borrarse" means in practice.
 */
export const useMachineDetailViewModel = ({
  machine,
  workerId,
}: MachineDetailProps): MachineDetailViewModel => {
  const router = useRouter();
  const photoUpload = useConditionPhotoUploadViewModel(
    machine.id,
    workerId
  );
  const [statusError, setStatusError] =
    useState<Nullable<string>>(null);
  const [isBusy, setIsBusy] = useState(false);

  const isOutOfService =
    machine.status !== UNIT_STATUS.AVAILABLE;

  const handleStatusChange = (): void => {
    setIsBusy(true);
    setStatusError(null);

    void updateUnitStatus(
      createBrowserSupabaseClient(),
      machine.id,
      isOutOfService
        ? UNIT_STATUS.AVAILABLE
        : UNIT_STATUS.IN_MAINTENANCE,
      workerId
    )
      .then(() => {
        setIsBusy(false);
        router.refresh();
      })
      .catch(() => {
        setIsBusy(false);
        setStatusError(MACHINE_DETAIL_SCREEN.ERROR);
      });
  };

  return {
    error: statusError ?? photoUpload.uploadError,
    handlePhotoSelected: photoUpload.handlePhotoSelected,
    handleStatusChange,
    isBusy,
    isOutOfService,
    uploadingAngle: photoUpload.uploadingAngle,
  };
};
