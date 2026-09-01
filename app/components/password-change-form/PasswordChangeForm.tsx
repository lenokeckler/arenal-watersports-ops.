"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  FIELD_IDS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  PASSWORD_CHANGE_SCREEN,
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
import PasswordChangeFormHeader from "./PasswordChangeFormHeader";
import { usePasswordChangeFormViewModel } from "./hooks/usePasswordChangeFormViewModel";
import type { PasswordChangeFormProps } from "./models/PasswordChangeFormProps.interface";

/**
 * Same dark glass-panel field styling the login screen introduced
 * (`app/components/login-form/LoginForm.tsx`), reused here rather than
 * duplicated into a shared constant: only two feature folders need it, and
 * `FormField`'s own hook still appends light-theme classes after this
 * string, so the `!important` prefixes are required either way.
 */
const FIELD_CLASS =
  "w-full !rounded-lg !border !border-outline-variant !bg-surface-container/50 !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-primary focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-primary/20";
const FIELD_ERROR_CLASS =
  "w-full !rounded-lg !border !border-error/50 !bg-surface-container/50 !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-error focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-error/20";

/**
 * Shared form behind `/acceso/primer-ingreso` (US-ACC-003) and
 * `/acceso/cambio-contrasena` (US-ACC-004): both confirm the password
 * currently on the account, type the new one, and repeat it, with the
 * password rules visible the whole time (section 3 of the access module
 * design). Presentation only — every decision lives in
 * `usePasswordChangeFormViewModel` (`component-architecture`).
 */
const PasswordChangeForm = ({
  mode,
}: PasswordChangeFormProps): JSX.Element => {
  const {
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
  } = usePasswordChangeFormViewModel({ mode });

  return (
    <main className="relative z-10 w-full max-w-form">
      <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container/70 p-md shadow-xl backdrop-blur-md sm:p-lg">
        <PasswordChangeFormHeader copy={copy} />

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

        <form
          className="flex flex-col gap-md"
          onSubmit={handleSubmit}
          noValidate
        >
          <FormField
            id={FIELD_IDS.CURRENT_PASSWORD}
            name={FIELD_IDS.CURRENT_PASSWORD}
            label={copy.CURRENT_PASSWORD_LABEL}
            labelSuffix={STRING.Empty}
            type={INPUT_TYPES.PASSWORD}
            placeholder={copy.CURRENT_PASSWORD_PLACEHOLDER}
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            error={currentPasswordError ?? undefined}
            showErrorText
            disabled={isSubmitting}
            classNameField={`${currentPasswordError ? FIELD_ERROR_CLASS : FIELD_CLASS} !pr-10`}
          />

          <FormField
            id={FIELD_IDS.NEW_PASSWORD}
            name={FIELD_IDS.NEW_PASSWORD}
            label={PASSWORD_CHANGE_SCREEN.NEW_PASSWORD_LABEL}
            labelSuffix={STRING.Empty}
            type={INPUT_TYPES.PASSWORD}
            placeholder={PASSWORD_CHANGE_SCREEN.NEW_PASSWORD_PLACEHOLDER}
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
            label={PASSWORD_CHANGE_SCREEN.CONFIRM_PASSWORD_LABEL}
            labelSuffix={STRING.Empty}
            type={INPUT_TYPES.PASSWORD}
            placeholder={
              PASSWORD_CHANGE_SCREEN.CONFIRM_PASSWORD_PLACEHOLDER
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
            className="mt-sm flex w-full min-h-14 items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary shadow-md transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Spinner size={SPINNER_SIZE.SMALL} />
            ) : (
              <>
                <span>{copy.SUBMIT}</span>
                <MaterialIcon
                  name={MATERIAL_ICON_NAME.LOCK_RESET}
                  className="!text-[18px]"
                />
              </>
            )}
          </Button>

          {!isFirstLogin && copy.BACK_TO_PROFILE && (
            <Link
              href={PATHS.COMMON.PROFILE}
              className="self-center text-label-mono text-primary/80 underline-offset-4 hover:text-primary hover:underline"
            >
              {copy.BACK_TO_PROFILE}
            </Link>
          )}
        </form>
      </div>
    </main>
  );
};

export default PasswordChangeForm;
