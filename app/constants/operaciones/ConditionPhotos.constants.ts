/** Mirrors the database's `photo_angle` enum (US-OPE-015). */
export const PHOTO_ANGLE = {
  BOTTOM: "bottom",
  FRONT: "front",
  LEFT_SIDE: "left_side",
  RIGHT_SIDE: "right_side",
} as const;

export type PhotoAngle =
  (typeof PHOTO_ANGLE)[keyof typeof PHOTO_ANGLE];

export const PHOTO_ANGLE_LABEL = {
  [PHOTO_ANGLE.BOTTOM]: "Por debajo",
  [PHOTO_ANGLE.FRONT]: "Frente",
  [PHOTO_ANGLE.LEFT_SIDE]: "Costado izquierdo",
  [PHOTO_ANGLE.RIGHT_SIDE]: "Costado derecho",
} as const satisfies Record<PhotoAngle, string>;

/**
 * US-OPE-015: "una por ángulo: costado derecho, costado izquierdo y
 * frente, y opcionalmente una por debajo". The order is the order the
 * screen shows them in, and the optional one goes last.
 */
export const REQUIRED_PHOTO_ANGLES: readonly PhotoAngle[] =
  [
    PHOTO_ANGLE.RIGHT_SIDE,
    PHOTO_ANGLE.LEFT_SIDE,
    PHOTO_ANGLE.FRONT,
  ];

export const OPTIONAL_PHOTO_ANGLES: readonly PhotoAngle[] =
  [PHOTO_ANGLE.BOTTOM];

export const ALL_PHOTO_ANGLES: readonly PhotoAngle[] = [
  ...REQUIRED_PHOTO_ANGLES,
  ...OPTIONAL_PHOTO_ANGLES,
];

export const CONDITION_PHOTOS = {
  /** Private bucket created in `20260828001750_condition_photo_storage.sql`. */
  BUCKET: "unit-condition-photos",
  /**
   * A signed URL long enough to look at the four angles on a phone with
   * bad signal, and short enough that a copied link stops working before
   * it leaves the dock.
   */
  SIGNED_URL_TTL_SECONDS: 3600,
  /** Matches the bucket's own `allowed_mime_types`. */
  ACCEPTED_MIME_TYPES: "image/jpeg,image/png,image/webp",
  /** Matches the bucket's own `file_size_limit`, in bytes. */
  MAX_FILE_SIZE_BYTES: 5_242_880,
} as const;
