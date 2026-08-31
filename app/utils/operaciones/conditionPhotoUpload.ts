import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  CONDITION_PHOTOS,
  type PhotoAngle,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { buildConditionPhotoPath } from "./conditionPhotos";

export interface ConditionPhotoUpload {
  angle: PhotoAngle;
  file: File;
  unitId: string;
  workerId: string;
}

/**
 * US-OPE-015: uploads the image and points the unit's row at it in the
 * same move. Both writes are gated on the `encargado_general` mark — the
 * storage policy and `photos_insert` carry the same condition, so the
 * screen hiding the button is never the only thing stopping anyone else.
 *
 * `upsert` on both sides is what "se reemplazan cuando cambia el estado"
 * means: the object overwrites its own path and the row overwrites its own
 * `(unit_id, angle)`, so a machine never accumulates one file per touch-up.
 */
export const uploadConditionPhoto = async (
  supabase: SupabaseClient<Database>,
  upload: ConditionPhotoUpload
): Promise<void> => {
  const storagePath = buildConditionPhotoPath(
    upload.unitId,
    upload.angle
  );

  const { error: storageError } = await supabase.storage
    .from(CONDITION_PHOTOS.BUCKET)
    .upload(storagePath, upload.file, {
      contentType: upload.file.type,
      upsert: true,
    });

  if (storageError) {
    throw storageError;
  }

  const { error } = await supabase
    .from("unit_condition_photos")
    .upsert(
      {
        angle: upload.angle,
        storage_path: storagePath,
        unit_id: upload.unitId,
        uploaded_at: new Date().toISOString(),
        uploaded_by: upload.workerId,
      },
      { onConflict: "unit_id,angle" }
    );
  throwIfSupabaseError(
    error,
    "operaciones.conditionPhotoUpload.uploadConditionPhoto"
  );
};
