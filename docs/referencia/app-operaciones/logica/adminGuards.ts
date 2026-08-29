export type GuardInput = {
  /** Target is the caller themselves. */
  isSelf: boolean;
  /** Target currently has the admin role. */
  targetIsAdmin: boolean;
  /** How many active (not blocked) admins exist right now. */
  activeAdminCount: number;
};

/** Can we block / reset / demote this target without locking the org out? */
export function checkAdminGuard(input: GuardInput): { ok: boolean; reason?: string } {
  if (input.isSelf) {
    return { ok: false, reason: 'No puedes bloquear ni modificar tu propia cuenta.' };
  }
  if (input.targetIsAdmin && input.activeAdminCount <= 1) {
    return { ok: false, reason: 'No puedes bloquear o degradar al último administrador.' };
  }
  return { ok: true };
}
