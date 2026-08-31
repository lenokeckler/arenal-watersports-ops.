"use client";

import type { JSX } from "react";
import {
  CONDITION_PHOTOS,
  INPUT_TYPES,
  MACHINE_DETAIL_SCREEN,
  PHOTO_ANGLE_LABEL,
  SPINNER_SIZE,
  type PhotoAngle,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import { formatShortDate } from "@/app/utils/tablero/formatDateTime";
import type { ConditionPhoto } from "@/app/utils/operaciones/conditionPhotos";
import Spinner from "@/app/components/spinner/Spinner";

interface MachineConditionPhotoSlotProps {
  angle: PhotoAngle;
  canUpload: boolean;
  isUploading: boolean;
  onPhotoSelected: (angle: PhotoAngle, file: File) => void;
  photo: Nullable<ConditionPhoto>;
}

const FRAME_CLASS =
  "flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-surface-container-low";
const ACTION_CLASS =
  "flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-primary/40 px-sm font-button text-button uppercase text-primary";

/**
 * One angle of one machine. The image is a plain `<img>` on purpose: the
 * bucket is private and the source is a short-lived signed URL, which the
 * Next.js image optimizer would both need whitelisting for and cache past
 * its own expiry.
 */
const MachineConditionPhotoSlot = ({
  angle,
  canUpload,
  isUploading,
  onPhotoSelected,
  photo,
}: MachineConditionPhotoSlotProps): JSX.Element => (
  <figure className="flex flex-col gap-1">
    <div className={FRAME_CLASS}>
      {photo?.signedUrl ? (
        <img
          src={photo.signedUrl}
          alt={PHOTO_ANGLE_LABEL[angle]}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="px-1 text-center font-label-mono text-label-mono uppercase text-outline">
          {PHOTO_ANGLE_LABEL[angle]}
        </span>
      )}
    </div>

    <figcaption className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {PHOTO_ANGLE_LABEL[angle]}
    </figcaption>

    {photo && (
      <span className="font-label-mono text-label-mono text-outline">
        {MACHINE_DETAIL_SCREEN.PHOTOS.UPLOADED_BY(
          photo.uploaderName,
          formatShortDate(photo.uploadedAt)
        )}
      </span>
    )}

    {canUpload && (
      <label className={ACTION_CLASS}>
        {isUploading ? (
          <Spinner size={SPINNER_SIZE.SMALL} />
        ) : (
          <>
            {photo
              ? MACHINE_DETAIL_SCREEN.PHOTOS.REPLACE
              : MACHINE_DETAIL_SCREEN.PHOTOS.UPLOAD}
            <input
              type={INPUT_TYPES.FILE}
              accept={CONDITION_PHOTOS.ACCEPTED_MIME_TYPES}
              className="hidden"
              onChange={(event) => {
                const [file] = event.target.files ?? [];

                if (file) {
                  onPhotoSelected(angle, file);
                }
              }}
            />
          </>
        )}
      </label>
    )}
  </figure>
);

export default MachineConditionPhotoSlot;
