import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Nullable } from "@/app/types";
import {
  CONDITION_PHOTOS,
  OPERATIONS_SIGNATURE,
  STRING,
  type PhotoAngle,
} from "@/app/constants";
import { throwIfSupabaseError } from "@/app/utils/supabase-error/SupabaseError";
import { fetchWorkerNames } from "./workerNames";

export interface ConditionPhoto {
  angle: PhotoAngle;
  signedUrl: Nullable<string>;
  uploadedAt: string;
  uploaderName: string;
}

interface ConditionPhotoQueryRow {
  angle: PhotoAngle;
  storage_path: string;
  uploaded_at: string;
  uploaded_by: string;
}

const CONDITION_PHOTO_SELECT =
  "angle, storage_path, uploaded_at, uploaded_by";

/**
 * One object per angle, overwritten in place: US-OPE-015 says the photos
 * "se reemplazan cuando cambia el estado", and `unit_condition_photos` is
 * unique on `(unit_id, angle)`. Keeping the path stable makes the storage
 * object follow the same rule instead of piling up one file per replacement.
 */
export const buildConditionPhotoPath = (
  unitId: string,
  angle: PhotoAngle
): string => `${unitId}${STRING.SLASH}${angle}`;

const NO_PATHS = 0;

/**
 * Storage rejects an empty `paths` array with a 400 rather than returning
 * nothing, so a machine that has no photos yet -- the state every unit
 * starts in -- would take its whole ficha down with it. The guard is the
 * fix, and it belongs here rather than at each call site.
 */
const signPhotoUrls = async (
  supabase: SupabaseClient<Database>,
  paths: string[]
): Promise<Map<string, string>> => {
  if (paths.length === NO_PATHS) {
    return new Map();
  }

  const { data, error } = await supabase.storage
    .from(CONDITION_PHOTOS.BUCKET)
    .createSignedUrls(
      paths,
      CONDITION_PHOTOS.SIGNED_URL_TTL_SECONDS
    );

  if (error) {
    throw error;
  }

  const signed = new Map<string, string>();

  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) {
      signed.set(entry.path, entry.signedUrl);
    }
  }

  return signed;
};

/**
 * US-OPE-016: the current photos of one machine, each with the signature
 * of whoever last replaced it. The bucket is private, so every image is
 * served through a short-lived signed URL rather than a public link.
 */
export const fetchConditionPhotos = async (
  supabase: SupabaseClient<Database>,
  unitId: string
): Promise<ConditionPhoto[]> => {
  const { data, error } = await supabase
    .from("unit_condition_photos")
    .select(CONDITION_PHOTO_SELECT)
    .eq("unit_id", unitId);
  throwIfSupabaseError(
    error,
    "operaciones.conditionPhotos.fetchConditionPhotos"
  );

  const rows = (data ??
    []) as unknown as ConditionPhotoQueryRow[];

  const [signedUrls, uploaderNames] = await Promise.all([
    signPhotoUrls(
      supabase,
      rows.map((row) => row.storage_path)
    ),
    fetchWorkerNames(
      supabase,
      rows.map((row) => row.uploaded_by)
    ),
  ]);

  return rows.map((row) => ({
    angle: row.angle,
    signedUrl: signedUrls.get(row.storage_path) ?? null,
    uploadedAt: row.uploaded_at,
    uploaderName:
      uploaderNames.get(row.uploaded_by) ??
      OPERATIONS_SIGNATURE.UNKNOWN_AUTHOR,
  }));
};
