"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  PASSWORD_CHANGE_MODE,
  PASSWORD_CHANGE_SCREEN,
  PATHS,
  STRING,
  CHANGE_PASSWORD_FAILURE_REASON,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) together with this one and
// breaks the client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import { checkPasswordValidity } from "@/app/utils/password/passwordUtils";
import { changeOwnPassword } from "@/app/utils/acceso/changePassword";
import type { Nullable } from "@/app/types";
import type { PasswordChangeFormProps } from "../models/PasswordChangeFormProps.interface";
import type { PasswordChangeFormViewModel } from "../models/PasswordChangeFormViewModel.interface";

type FieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

/**
 * All the logic behind `PasswordChangeForm` (US-ACC-003, US-ACC-004): both
 * stories require confirming the current (or temporary) password before
 * accepting a new one, so both screens share this hook and differ only in
 * copy (`PASSWORD_CHANGE_SCREEN[mode]`) and in what happens after success —
 * the first-login screen also clears `must_change_password` and hands the
 * redirect to the proxy; the voluntary screen just confirms in place.
 */
export const usePasswordChangeFormViewModel = ({
  mode,
}: PasswordChangeFormProps): PasswordChangeFormViewModel => {
  const router = useRouter();
  const isFirstLogin = mode === PASSWORD_CHANGE_MODE.FIRST_LOGIN;
  const copy = PASSWORD_CHANGE_SCREEN[mode];

  const [currentPassword, setCurrentPassword] =
    useState<string>(STRING.Empty);
  const [newPassword, setNewPassword] =
    useState<string>(STRING.Empty);
  const [confirmPassword, setConfirmPassword] =
    useState<string>(STRING.Empty);

  const [currentPasswordError, setCurrentPasswordError] =
    useState<Nullable<string>>(null);
  const [newPasswordError, setNewPasswordError] =
    useState<Nullable<string>>(null);
  const [confirmPasswordError, setConfirmPasswordError] =
    useState<Nullable<string>>(null);
  const [formError, setFormError] =
    useState<Nullable<string>>(null);
  const [successMessage, setSuccessMessage] =
    useState<Nullable<string>>(null);

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const clearFeedback = (): void => {
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleCurrentPasswordChange = (
    event: FieldChangeEvent
  ): void => {
    setCurrentPassword(event.target.value);
    setCurrentPasswordError(null);
  };

  const handleNewPasswordChange = (
    event: FieldChangeEvent
  ): void => {
    setNewPassword(event.target.value);
    setNewPasswordError(null);
  };

  const handleConfirmPasswordChange = (
    event: FieldChangeEvent
  ): void => {
    setConfirmPassword(event.target.value);
    setConfirmPasswordError(null);
  };

  /**
   * Client-side validation before touching the network (section 3 of the
   * access module design: the new password must satisfy every rule, and
   * the two entries must match). Returns whether the form is valid; each
   * failure is set next to the field that caused it.
   */
  const validate = (): boolean => {
    let isValid = true;

    if (!currentPassword) {
      setCurrentPasswordError(
        PASSWORD_CHANGE_SCREEN.ERROR.CURRENT_PASSWORD_REQUIRED
      );
      isValid = false;
    }

    if (!newPassword) {
      setNewPasswordError(
        PASSWORD_CHANGE_SCREEN.ERROR.NEW_PASSWORD_REQUIRED
      );
      isValid = false;
    } else {
      const validity = checkPasswordValidity(newPassword);
      const isNewPasswordValid =
        validity.isLengthValid &&
        validity.isUpperValid &&
        validity.isLowerValid &&
        validity.isNumberValid &&
        validity.isSymbolValid;

      if (!isNewPasswordValid) {
        setNewPasswordError(
          PASSWORD_CHANGE_SCREEN.ERROR.NEW_PASSWORD_INVALID
        );
        isValid = false;
      }
    }

    if (newPassword && confirmPassword !== newPassword) {
      setConfirmPasswordError(
        PASSWORD_CHANGE_SCREEN.ERROR.CONFIRM_MISMATCH
      );
      isValid = false;
    }

    return isValid;
  };

  const submit = async (): Promise<void> => {
    setIsSubmitting(true);

    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setFormError(PASSWORD_CHANGE_SCREEN.ERROR.GENERIC);
      setIsSubmitting(false);
      return;
    }

    const result = await changeOwnPassword(
      supabase,
      user.email,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      if (
        result.reason ===
        CHANGE_PASSWORD_FAILURE_REASON.CURRENT_PASSWORD_INCORRECT
      ) {
        setCurrentPasswordError(copy.CURRENT_PASSWORD_ERROR);
      } else {
        setFormError(PASSWORD_CHANGE_SCREEN.ERROR.GENERIC);
      }
      setIsSubmitting(false);
      return;
    }

    if (!isFirstLogin) {
      setSuccessMessage(PASSWORD_CHANGE_SCREEN.SUCCESS);
      setCurrentPassword(STRING.Empty);
      setNewPassword(STRING.Empty);
      setConfirmPassword(STRING.Empty);
      setIsSubmitting(false);
      return;
    }

    // First login: the password is already changed, so the one-time
    // temporary password is spent. Clear the gate the proxy checks on
    // every route (US-ACC-003) — RLS lets a worker update their own row.
    const { error: clearGateError } = await supabase
      .from("workers")
      .update({ must_change_password: false })
      .eq("id", user.id);

    if (clearGateError) {
      setFormError(PASSWORD_CHANGE_SCREEN.ERROR.GENERIC);
      setIsSubmitting(false);
      return;
    }

    // Leave the redirect decision to the proxy (section 4 of the design):
    // it re-reads `must_change_password` and sends this worker to the
    // work-mode selector or the dashboard, whichever applies.
    router.replace(PATHS.COMMON.DASHBOARD);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    clearFeedback();

    if (!validate()) {
      return;
    }

    void submit();
  };

  return {
    confirmPassword,
    confirmPasswordError,
    copy,
    currentPassword,
    currentPasswordError,
    formError,
    handleConfirmPasswordChange,
    handleCurrentPasswordChange,
    handleNewPasswordChange,
    handleSubmit,
    isFirstLogin,
    isSubmitting,
    newPassword,
    newPasswordError,
    successMessage,
  };
};
