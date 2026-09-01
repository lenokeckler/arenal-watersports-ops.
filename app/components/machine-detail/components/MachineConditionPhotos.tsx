"use client";

import type { JSX } from "react";
import {
  ALL_PHOTO_ANGLES,
  MACHINE_DETAIL_SCREEN,
  type PhotoAngle,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { ConditionPhoto } from "@/app/utils/operaciones/conditionPhotos";
import MachineConditionPhotoSlot from "./MachineConditionPhotoSlot";

interface MachineConditionPhotosProps {
  canUpload: boolean;
  impactCount: number;
  onPhotoSelected: (angle: PhotoAngle, file: File) => void;
  photos: ConditionPhoto[];
  uploadingAngle: Nullable<PhotoAngle>;
}

const SECTION_CLASS =
  "flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md";

/**
 * US-OPE-016: the four angles next to the accumulated impact count, which
 * is the comparison the story asks for — "cómo está hoy contra cómo vuelve
 * de una salida". The upload control only renders for the
 * `encargado_general` mark (US-OPE-015); the storage policy enforces the
 * same rule regardless of what renders.
 */
const MachineConditionPhotos = ({
  canUpload,
  impactCount,
  onPhotoSelected,
  photos,
  uploadingAngle,
}: MachineConditionPhotosProps): JSX.Element => (
  <section className={SECTION_CLASS}>
    <header className="flex flex-wrap items-baseline justify-between gap-sm">
      <h2 className="font-title-md text-title-md text-on-surface">
        {MACHINE_DETAIL_SCREEN.PHOTOS.TITLE}
      </h2>
      <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
        {`${MACHINE_DETAIL_SCREEN.TELEMETRY.IMPACTS}: ${impactCount}`}
      </span>
    </header>

    <div className="grid grid-cols-2 gap-sm md:grid-cols-4">
      {ALL_PHOTO_ANGLES.map((angle) => (
        <MachineConditionPhotoSlot
          key={angle}
          angle={angle}
          canUpload={canUpload}
          isUploading={uploadingAngle === angle}
          onPhotoSelected={onPhotoSelected}
          photo={
            photos.find(
              (candidate) => candidate.angle === angle
            ) ?? null
          }
        />
      ))}
    </div>

    {!canUpload && (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {MACHINE_DETAIL_SCREEN.PHOTOS.NOT_ALLOWED}
      </p>
    )}
  </section>
);

export default MachineConditionPhotos;
