"use client";

import type { JSX } from "react";
import {
  ACCESS_LOGIN_SCREEN,
  BUTTON,
  BUTTON_TYPES,
  FIELD_IDS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  PATHS,
  SPINNER_SIZE,
  STRING,
  TitleVariant,
} from "@/app/constants";
import Button from "../button/Button";
import FormField from "../form-field/FormField";
import Link from "../link/Link";
import PasswordRules from "../password-rules/PasswordRules";
import Spinner from "../spinner/Spinner";
import Text from "../text/Text";
import Title from "../title/Title";
import MaterialIcon from "../icons/material-icon/MaterialIcon";
import LoginFormBanner from "./LoginFormBanner";
import { useLoginFormViewModel } from "./hooks/useLoginFormViewModel";

/**
 * The dark glass-panel field styling from the Stitch reference
 * (`docs/referencia/stitch/ingreso-al-sistema--movil.html`), applied over
 * `FormField` through `classNameField` rather than forking the base
 * component (`component-standards` §1). The `!` prefixes are required:
 * `FormField`'s own hook always appends its light-theme classes after this
 * string, so only `!important` utilities are guaranteed to win.
 */
const FIELD_CLASS =
  "w-full !rounded-lg !border !border-white/10 !bg-surface-container/50 !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-primary focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-primary/20";
const FIELD_ERROR_CLASS =
  "w-full !rounded-lg !border !border-error/50 !bg-surface-container/50 !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-error focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-error/20";

/**
 * Login form for `/acceso/ingreso` (US-ACC-001, US-ACC-002). Presentation
 * only — every decision lives in `useLoginFormViewModel`
 * (`component-architecture`).
 */
const LoginForm = (): JSX.Element => {
  const {
    bannerMessage,
    handlePasswordChange,
    handleSubmit,
    handleUsernameChange,
    isSubmitting,
    password,
    passwordError,
    username,
    usernameError,
  } = useLoginFormViewModel();

  return (
    <main className="relative z-10 w-full max-w-md px-margin-mobile">
      <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-surface-container/70 p-md shadow-xl backdrop-blur-md sm:p-lg">
        <div className="mb-md flex flex-col items-center text-center">
          <Title
            variant={TitleVariant.PRIMARY}
            text={ACCESS_LOGIN_SCREEN.APP_NAME}
            className="!text-headline-lg-mobile font-semibold tracking-tight text-primary"
          />
          <Text className="!mt-xs !text-body-base text-on-surface-variant">
            {ACCESS_LOGIN_SCREEN.APP_SUBTITLE}
          </Text>
        </div>

        {bannerMessage && <LoginFormBanner message={bannerMessage} />}

        <form
          className="flex flex-col gap-md"
          onSubmit={handleSubmit}
          noValidate
        >
          <FormField
            id={FIELD_IDS.USERNAME}
            name={FIELD_IDS.USERNAME}
            label={ACCESS_LOGIN_SCREEN.USERNAME_LABEL}
            labelSuffix={STRING.Empty}
            placeholder={ACCESS_LOGIN_SCREEN.USERNAME_PLACEHOLDER}
            value={username}
            onChange={handleUsernameChange}
            error={usernameError ?? undefined}
            showErrorText
            disabled={isSubmitting}
            classNameField={
              usernameError ? FIELD_ERROR_CLASS : FIELD_CLASS
            }
          />

          <div className="flex flex-col gap-xs">
            <FormField
              id={FIELD_IDS.PASSWORD}
              name={FIELD_IDS.PASSWORD}
              label={ACCESS_LOGIN_SCREEN.PASSWORD_LABEL}
              labelSuffix={STRING.Empty}
              type={INPUT_TYPES.PASSWORD}
              placeholder={ACCESS_LOGIN_SCREEN.PASSWORD_PLACEHOLDER}
              value={password}
              onChange={handlePasswordChange}
              error={passwordError ?? undefined}
              showErrorText
              disabled={isSubmitting}
              classNameField={`${passwordError ? FIELD_ERROR_CLASS : FIELD_CLASS} !pr-10`}
            />

            <PasswordRules password={password} />

            <Link
              href={PATHS.ACCESS.PASSWORD_RECOVERY}
              className="self-end text-label-mono text-primary/80 underline-offset-4 hover:text-primary hover:underline"
            >
              {ACCESS_LOGIN_SCREEN.FORGOT_PASSWORD}
            </Link>
          </div>

          <Button
            type={BUTTON_TYPES.SUBMIT}
            variant={BUTTON.BASE}
            disabled={isSubmitting}
            className="mt-sm flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary shadow-md transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Spinner size={SPINNER_SIZE.SMALL} />
            ) : (
              <>
                <span>{ACCESS_LOGIN_SCREEN.SUBMIT}</span>
                <MaterialIcon
                  name={MATERIAL_ICON_NAME.LOGIN}
                  className="!text-[18px]"
                />
              </>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default LoginForm;
