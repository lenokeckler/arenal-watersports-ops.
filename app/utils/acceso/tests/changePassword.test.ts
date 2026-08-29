import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CHANGE_PASSWORD_FAILURE_REASON } from "@/app/constants";
import type { Database } from "@/app/types";
import { changeOwnPassword } from "../changePassword";

/**
 * Only the two `auth` methods `changeOwnPassword` calls are mocked — enough
 * to prove the re-authentication gate actually rejects a wrong current
 * password (the trap called out in the access module design) without
 * standing up a real Supabase client.
 */
const buildSupabaseMock = (
  signInWithPasswordError: unknown,
  updateUserError: unknown = null
): {
  client: SupabaseClient<Database>;
  signInWithPassword: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
} => {
  const signInWithPassword = vi
    .fn()
    .mockResolvedValue({ error: signInWithPasswordError });
  const updateUser = vi
    .fn()
    .mockResolvedValue({ error: updateUserError });

  const client = {
    auth: { signInWithPassword, updateUser },
  } as unknown as SupabaseClient<Database>;

  return { client, signInWithPassword, updateUser };
};

describe("changeOwnPassword", () => {
  it("rejects a wrong current password without ever calling updateUser", async () => {
    const { client, updateUser } = buildSupabaseMock({
      message: "Invalid login credentials",
    });

    const result = await changeOwnPassword(
      client,
      "operador@arenal.local",
      "wrong-temp-password",
      "Nueva.Clave2026"
    );

    expect(result).toEqual({
      reason:
        CHANGE_PASSWORD_FAILURE_REASON.CURRENT_PASSWORD_INCORRECT,
      success: false,
    });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("updates the password once the current one is verified", async () => {
    const { client, signInWithPassword, updateUser } =
      buildSupabaseMock(null);

    const result = await changeOwnPassword(
      client,
      "operador@arenal.local",
      "Correct.Temp2026",
      "Nueva.Clave2026"
    );

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "operador@arenal.local",
      password: "Correct.Temp2026",
    });
    expect(updateUser).toHaveBeenCalledWith({
      password: "Nueva.Clave2026",
    });
    expect(result).toEqual({ success: true });
  });

  it("reports an unexpected error when the current password is right but the update itself fails", async () => {
    const { client } = buildSupabaseMock(null, {
      message: "network error",
    });

    const result = await changeOwnPassword(
      client,
      "operador@arenal.local",
      "Correct.Temp2026",
      "Nueva.Clave2026"
    );

    expect(result).toEqual({
      reason: CHANGE_PASSWORD_FAILURE_REASON.UNEXPECTED_ERROR,
      success: false,
    });
  });
});
