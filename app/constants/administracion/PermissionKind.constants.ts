/**
 * Discriminates the two things `/permisos` grants or revokes on a worker
 * (US-ADM-002 through US-ADM-005): a whole additional area, or one of the
 * three marks.
 */
export const PERMISSION_KIND = {
  AREA: "area",
  MARK: "mark",
} as const;

export type PermissionKind =
  (typeof PERMISSION_KIND)[keyof typeof PERMISSION_KIND];
