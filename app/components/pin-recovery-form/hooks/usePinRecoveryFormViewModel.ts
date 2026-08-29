"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  API,
  PASSWORD_RECOVERY_SCREEN,
  PASSWORD_RECOVERY_STEP,
  STRING,
  type PasswordRecoveryStep,
} from "@/app/constants";
import { checkPasswordValidity } from "@/app/utils/password/passwordUtils";
import type { Nullable } from "@/app/types";
import type { PasswordRecoveryPinRequestBody } from "@/app/api/acceso/pin-recuperacion/route";
import type { PasswordRecoveryVerifyRequestBody } from "@/app/api/acceso/verificar-pin/route";
import type { PinRecoveryFormViewModel } from "../models/PinRecoveryFormViewModel.interface";

type FieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

const PIN_PATTERN = /^\d{6}$/;

const postJson = async (
  route: string,
  body: PasswordRecoveryPinRequestBody | PasswordRecoveryVerifyRequestBody
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const response = await fetch(route, {
      body: JSON.stringify(body),
      headers: { [API.HEADERS.CONTENT_TYPE]: API.HEADERS.JSON },
      method: API.METHODS.POST,
    });

    if (response.ok) {
      return { ok: true };
    }

    const responseBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    return { error: responseBody?.error, ok: false };
  } catch {
    return { ok: false };
  }
};

/**
 * All the logic behind `PinRecoveryForm` (US-ACC-006, US-ACC-007): two
 * steps in one screen — request a PIN by username, then submit the PIN
 * with the new password — talking to the two routes the design names,
 * `PASSWORD_RECOVERY_PIN` and `PASSWORD_RECOVERY_VERIFY`. Both requests
 * always move the screen forward on a 200 regardless of what actually
 * happened server-side (account missing, no email, or a PIN really sent):
 * branching the UI on that would recreate the enumeration hole the design
 * closes by making the response identical (section 7).
 */
export const usePinRecoveryFormViewModel =
  (): PinRecoveryFormViewModel => {
    const [step, setStep] = useState<PasswordRecoveryStep>(
      PASSWORD_RECOVERY_STEP.REQUEST_PIN
    );

    const [username, setUsername] = useState<string>(STRING.Empty);
    const [pin, setPin] = useState<string>(STRING.Empty);
    const [newPassword, setNewPassword] = useState<string>(
      STRING.Empty
    );
    const [confirmPassword, setConfirmPassword] = useState<string>(
      STRING.Empty
    );

    const [usernameError, setUsernameError] =
      useState<Nullable<string>>(null);
    const [pinError, setPinError] = useState<Nullable<string>>(null);
    const [newPasswordError, setNewPasswordError] =
      useState<Nullable<string>>(null);
    const [confirmPasswordError, setConfirmPasswordError] =
      useState<Nullable<string>>(null);
    const [formError, setFormError] = useState<Nullable<string>>(
      null
    );
    const [successMessage, setSuccessMessage] =
      useState<Nullable<string>>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const clearFeedback = (): void => {
      setUsernameError(null);
      setPinError(null);
      setNewPasswordError(null);
      setConfirmPasswordError(null);
      setFormError(null);
    };

    const handleUsernameChange = (
      event: FieldChangeEvent
    ): void => {
      setUsername(event.target.value);
      setUsernameError(null);
    };

    const handlePinChange = (event: FieldChangeEvent): void => {
      setPin(event.target.value.replace(/\D/g, STRING.Empty));
      setPinError(null);
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

    const handleChangeUsername = (): void => {
      setStep(PASSWORD_RECOVERY_STEP.REQUEST_PIN);
      setPin(STRING.Empty);
      setNewPassword(STRING.Empty);
      setConfirmPassword(STRING.Empty);
      setSuccessMessage(null);
      clearFeedback();
    };

    const requestPin = async (
      normalizedUsername: string
    ): Promise<void> => {
      setIsSubmitting(true);

      await postJson(API.ROUTES.PASSWORD_RECOVERY_PIN, {
        username: normalizedUsername,
      });

      // Always advances, regardless of the outcome above — see the note
      // on the hook itself.
      setStep(PASSWORD_RECOVERY_STEP.RESET_PASSWORD);
      setSuccessMessage(PASSWORD_RECOVERY_SCREEN.SUCCESS_PIN_SENT);
      setIsSubmitting(false);
    };

    const handleRequestPinSubmit = (
      event: FormEvent<HTMLFormElement>
    ): void => {
      event.preventDefault();
      clearFeedback();

      const normalizedUsername = username.trim();
      if (!normalizedUsername) {
        setUsernameError(
          PASSWORD_RECOVERY_SCREEN.ERROR.USERNAME_REQUIRED
        );
        return;
      }

      void requestPin(normalizedUsername);
    };

    const validateResetPassword = (): boolean => {
      let isValid = true;

      if (!PIN_PATTERN.test(pin)) {
        setPinError(PASSWORD_RECOVERY_SCREEN.ERROR.PIN_REQUIRED);
        isValid = false;
      }

      if (!newPassword) {
        setNewPasswordError(
          PASSWORD_RECOVERY_SCREEN.ERROR.NEW_PASSWORD_REQUIRED
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
            PASSWORD_RECOVERY_SCREEN.ERROR.NEW_PASSWORD_INVALID
          );
          isValid = false;
        }
      }

      if (newPassword && confirmPassword !== newPassword) {
        setConfirmPasswordError(
          PASSWORD_RECOVERY_SCREEN.ERROR.CONFIRM_MISMATCH
        );
        isValid = false;
      }

      return isValid;
    };

    const resetPassword = async (): Promise<void> => {
      setIsSubmitting(true);

      const result = await postJson(API.ROUTES.PASSWORD_RECOVERY_VERIFY, {
        newPassword,
        pin,
        username: username.trim(),
      });

      if (!result.ok) {
        setPinError(result.error ?? PASSWORD_RECOVERY_SCREEN.ERROR.PIN_REQUIRED);
        setFormError(result.error ?? PASSWORD_RECOVERY_SCREEN.ERROR.GENERIC);
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(PASSWORD_RECOVERY_SCREEN.SUCCESS);
      setIsSuccess(true);
      setIsSubmitting(false);
    };

    const handleResetPasswordSubmit = (
      event: FormEvent<HTMLFormElement>
    ): void => {
      event.preventDefault();
      setFormError(null);
      setPinError(null);
      setNewPasswordError(null);
      setConfirmPasswordError(null);

      if (!validateResetPassword()) {
        return;
      }

      void resetPassword();
    };

    return {
      confirmPassword,
      confirmPasswordError,
      formError,
      handleChangeUsername,
      handleConfirmPasswordChange,
      handleNewPasswordChange,
      handlePinChange,
      handleRequestPinSubmit,
      handleResetPasswordSubmit,
      handleUsernameChange,
      isSubmitting,
      isSuccess,
      newPassword,
      newPasswordError,
      pin,
      pinError,
      step,
      successMessage,
      username,
      usernameError,
    };
  };
