import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CHANGE_PASSWORD_FAILURE_REASON,
  type ChangePasswordFailureReason,
} from "@/app/constants";
import type { Database } from "@/app/types";

export type ChangePasswordResult =
  | { success: true }
  | { success: false; reason: ChangePasswordFailureReason };

/**
 * Changes the password of whoever holds the given Supabase session — but
 * only after proving they actually know the current one. `updateUser({
 * password })` does not check the old password by itself: it rewrites the
 * password for whoever holds the session, so anyone holding an unlocked
 * phone could change its owner's password without this check. US-ACC-003
 * (temporary password) and US-ACC-004 (voluntary change) both require
 * confirming the current password first, so this re-authenticates with it
 * via `signInWithPassword` before calling `updateUser`. A wrong current
 * password fails `signInWithPassword` with the same error a wrong password
 * produces at login, which is what actually rejects it here.
 */
export const changeOwnPassword = async (
  supabase: SupabaseClient<Database>,
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult> => {
  const { error: reauthenticationError } =
    await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

  if (reauthenticationError) {
    return {
      reason:
        CHANGE_PASSWORD_FAILURE_REASON.CURRENT_PASSWORD_INCORRECT,
      success: false,
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return {
      reason: CHANGE_PASSWORD_FAILURE_REASON.UNEXPECTED_ERROR,
      success: false,
    };
  }

  return { success: true };
};
