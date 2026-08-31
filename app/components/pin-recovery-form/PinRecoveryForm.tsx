"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  FIELD_IDS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  PASSWORD_RECOVERY_SCREEN,
  PASSWORD_RECOVERY_STEP,
  PATHS,
  SPINNER_SIZE,
  STRING,
} from "@/app/constants";
import Button from "../button/Button";
import FormField from "../form-field/FormField";
import Link from "../link/Link";
import PasswordRules from "../password-rules/PasswordRules";
import Spinner from "../spinner/Spinner";
import Text from "../text/Text";
import MaterialIcon from "../icons/material-icon/MaterialIcon";
import PinRecoveryFormHeader from "./PinRecoveryFormHeader";
import { usePinRecoveryFormViewModel } from "./hooks/usePinRecoveryFormViewModel";

/**
 * Same dark glass-panel field styling as the rest of the access module
 * (see `LoginForm.tsx` / `PasswordChangeForm.tsx`) — kept local rather than
 * shared because it needs the `!important` prefixes either way, and only
 * three feature folders use it so far.
 */
const FIELD_CLASS =
  "w-full !rounded-lg !border !border-white/10 !bg-surface-container/50 !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-primary focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-primary/20";
const FIELD_ERROR_CLASS =
  "w-full !rounded-lg !border !border-error/50 !bg-surface-container/50 !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-error focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-error/20";

/**
 * `/acceso/recuperar-contrasena` (US-ACC-006, US-ACC-007): one screen, two
 * steps. Step one only ever asks for a username and always moves forward
 * — see `usePinRecoveryFormViewModel` for why. Step two asks for the PIN
 * and the new password twice, with `PasswordRules` visible the whole time,
 * same as the two password-change screens. Presentation only; every
 * decision lives in the hook (`component-architecture`).
 */
const PinRecoveryForm = (): JSX.Element => {
  const {
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
  } = usePinRecoveryFormViewModel();

  const isRequestPinStep = step === PASSWORD_RECOVERY_STEP.REQUEST_PIN;
  // Indexed with the literal keys (not the `step` union) so TypeScript
  // narrows each constant to its own shape — `resetPasswordCopy` is the
  // only one with `CHANGE_USERNAME`.
  const requestPinCopy =
    PASSWORD_RECOVERY_SCREEN[PASSWORD_RECOVERY_STEP.REQUEST_PIN];
  const resetPasswordCopy =
    PASSWORD_RECOVERY_SCREEN[PASSWORD_RECOVERY_STEP.RESET_PASSWORD];

  return (
    <main className="relative z-10 w-full max-w-form px-margin-mobile">
      <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-surface-container/70 p-md shadow-xl backdrop-blur-md sm:p-lg">
        <PinRecoveryFormHeader
          title={
            isRequestPinStep
              ? requestPinCopy.TITLE
              : resetPasswordCopy.TITLE
          }
          subtitle={
            isRequestPinStep
              ? requestPinCopy.SUBTITLE
              : resetPasswordCopy.SUBTITLE
          }
        />

        {formError && (
          <div className="mb-md flex animate-shake items-start gap-sm rounded-lg border border-error/50 bg-error-container/20 p-sm">
            <MaterialIcon
              name={MATERIAL_ICON_NAME.ERROR}
              className="!text-[20px] mt-0.5 text-error"
            />
            <Text className="!text-[13px] text-error">
              {formError}
            </Text>
          </div>
        )}

        {successMessage && (
          <div className="mb-md flex items-start gap-sm rounded-lg border border-primary/40 bg-primary/10 p-sm">
            <MaterialIcon
              name={MATERIAL_ICON_NAME.CHECK_CIRCLE}
              className="!text-[20px] mt-0.5 text-primary"
            />
            <Text className="!text-[13px] text-primary">
              {successMessage}
            </Text>
          </div>
        )}

        {isSuccess ? (
          <Link
            href={PATHS.ACCESS.LOGIN}
            className="mt-sm flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary shadow-md transition-transform duration-200 active:scale-95"
          >
            {PASSWORD_RECOVERY_SCREEN.BACK_TO_LOGIN}
          </Link>
        ) : isRequestPinStep ? (
          <form
            className="flex flex-col gap-md"
            onSubmit={handleRequestPinSubmit}
            noValidate
          >
            <FormField
              id={FIELD_IDS.USERNAME}
              name={FIELD_IDS.USERNAME}
              label={PASSWORD_RECOVERY_SCREEN.USERNAME_LABEL}
              labelSuffix={STRING.Empty}
              placeholder={PASSWORD_RECOVERY_SCREEN.USERNAME_PLACEHOLDER}
              value={username}
              onChange={handleUsernameChange}
              error={usernameError ?? undefined}
              showErrorText
              disabled={isSubmitting}
              classNameField={
                usernameError ? FIELD_ERROR_CLASS : FIELD_CLASS
              }
            />

            <Button
              type={BUTTON_TYPES.SUBMIT}
              variant={BUTTON.BASE}
              disabled={isSubmitting}
              className="mt-sm flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary shadow-md transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Spinner size={SPINNER_SIZE.SMALL} />
              ) : (
                <>
                  <span>{requestPinCopy.SUBMIT}</span>
                  <MaterialIcon
                    name={MATERIAL_ICON_NAME.MAIL}
                    className="!text-[18px]"
                  />
                </>
              )}
            </Button>

            <Link
              href={PATHS.ACCESS.LOGIN}
              className="self-center text-label-mono text-primary/80 underline-offset-4 hover:text-primary hover:underline"
            >
              {PASSWORD_RECOVERY_SCREEN.BACK_TO_LOGIN}
            </Link>
          </form>
        ) : (
          <form
            className="flex flex-col gap-md"
            onSubmit={handleResetPasswordSubmit}
            noValidate
          >
            <FormField
              id={FIELD_IDS.PIN}
              name={FIELD_IDS.PIN}
              label={PASSWORD_RECOVERY_SCREEN.PIN_LABEL}
              labelSuffix={STRING.Empty}
              placeholder={PASSWORD_RECOVERY_SCREEN.PIN_PLACEHOLDER}
              value={pin}
              onChange={handlePinChange}
              error={pinError ?? undefined}
              showErrorText
              disabled={isSubmitting}
              classNameField={`${pinError ? FIELD_ERROR_CLASS : FIELD_CLASS} tracking-[0.5em] text-center`}
            />
            <Text className="!-mt-sm !text-[12px] text-on-surface-variant">
              {PASSWORD_RECOVERY_SCREEN.PIN_HELPER}
            </Text>

            <FormField
              id={FIELD_IDS.NEW_PASSWORD}
              name={FIELD_IDS.NEW_PASSWORD}
              label={PASSWORD_RECOVERY_SCREEN.NEW_PASSWORD_LABEL}
              labelSuffix={STRING.Empty}
              type={INPUT_TYPES.PASSWORD}
              placeholder={PASSWORD_RECOVERY_SCREEN.NEW_PASSWORD_PLACEHOLDER}
              value={newPassword}
              onChange={handleNewPasswordChange}
              error={newPasswordError ?? undefined}
              showErrorText
              disabled={isSubmitting}
              classNameField={`${newPasswordError ? FIELD_ERROR_CLASS : FIELD_CLASS} !pr-10`}
            />

            <PasswordRules password={newPassword} />

            <FormField
              id={FIELD_IDS.CONFIRM_PASSWORD}
              name={FIELD_IDS.CONFIRM_PASSWORD}
              label={PASSWORD_RECOVERY_SCREEN.CONFIRM_PASSWORD_LABEL}
              labelSuffix={STRING.Empty}
              type={INPUT_TYPES.PASSWORD}
              placeholder={
                PASSWORD_RECOVERY_SCREEN.CONFIRM_PASSWORD_PLACEHOLDER
              }
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={confirmPasswordError ?? undefined}
              showErrorText
              disabled={isSubmitting}
              classNameField={`${confirmPasswordError ? FIELD_ERROR_CLASS : FIELD_CLASS} !pr-10`}
            />

            <Button
              type={BUTTON_TYPES.SUBMIT}
              variant={BUTTON.BASE}
              disabled={isSubmitting}
              className="mt-sm flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary shadow-md transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Spinner size={SPINNER_SIZE.SMALL} />
              ) : (
                <>
                  <span>{resetPasswordCopy.SUBMIT}</span>
                  <MaterialIcon
                    name={MATERIAL_ICON_NAME.LOCK_RESET}
                    className="!text-[18px]"
                  />
                </>
              )}
            </Button>

            <Button
              type={BUTTON_TYPES.BUTTON}
              variant={BUTTON.BASE}
              onClick={handleChangeUsername}
              disabled={isSubmitting}
              className="self-center text-label-mono text-primary/80 underline-offset-4 hover:text-primary hover:underline"
            >
              {resetPasswordCopy.CHANGE_USERNAME}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
};

export default PinRecoveryForm;
