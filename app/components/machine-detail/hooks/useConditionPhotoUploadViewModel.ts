"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MACHINE_DETAIL_SCREEN,
  type PhotoAngle,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) with this one and breaks the
// client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { uploadConditionPhoto } from "@/app/utils/operaciones/conditionPhotoUpload";

interface ConditionPhotoUploadViewModel {
  handlePhotoSelected: (
    angle: PhotoAngle,
    file: File
  ) => void;
  uploadError: Nullable<string>;
  uploadingAngle: Nullable<PhotoAngle>;
}

/**
 * US-OPE-015: replacing one angle of one machine. Kept apart from the
 * ficha's own ViewModel because it owns a different failure mode — a file
 * the bucket rejects by size or type — and a different busy state, per
 * angle rather than per screen.
 */
export const useConditionPhotoUploadViewModel = (
  unitId: string,
  workerId: string
): ConditionPhotoUploadViewModel => {
  const router = useRouter();
  const [uploadingAngle, setUploadingAngle] =
    useState<Nullable<PhotoAngle>>(null);
  const [uploadError, setUploadError] =
    useState<Nullable<string>>(null);

  const handlePhotoSelected = (
    angle: PhotoAngle,
    file: File
  ): void => {
    setUploadingAngle(angle);
    setUploadError(null);

    void uploadConditionPhoto(
      createBrowserSupabaseClient(),
      { angle, file, unitId, workerId }
    )
      .then(() => {
        setUploadingAngle(null);
        router.refresh();
      })
      .catch(() => {
        setUploadingAngle(null);
        setUploadError(
          MACHINE_DETAIL_SCREEN.PHOTOS.UPLOAD_ERROR
        );
      });
  };

  return {
    handlePhotoSelected,
    uploadError,
    uploadingAngle,
  };
};
