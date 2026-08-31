"use client";

import type { JSX } from "react";
import {
  ACCESS_LOGIN_SCREEN,
  BUTTON,
  BUTTON_TYPES,
  FIELD_IDS,
  IMAGES_PATHS,
  IMAGE_ALTS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  PATHS,
  SPINNER_SIZE,
  STRING,
  TitleVariant,
} from "@/app/constants";
import Button from "../button/Button";
import FormField from "../form-field/FormField";
import Image from "../image/Image";
import Link from "../link/Link";
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
 *
 * Deliberate deviation from US-ACC-001 (ruling A8, module owner): the
 * criterion "las reglas de la contraseña se muestran desde antes de
 * escribirla" does not apply here even though it is literally about the
 * login form's password field. `PasswordRules` was built and shown on this
 * screen by the previous batch, then removed after the owner saw it
 * rendered and rejected it, on three grounds — the Stitch design for this
 * screen never showed it, the rules cannot help someone typing a password
 * they already have (they matter when a password is *created*), and
 * showing creation requirements on a sign-in form reads as broken, not
 * helpful. The checklist still exists (`../password-rules/PasswordRules`)
 * and is used where the criterion actually applies: first login
 * (`/acceso/primer-ingreso`) and the voluntary change
 * (`/acceso/cambio-contrasena`), both in `PasswordChangeForm`.
 *
 * Restyled to `docs/referencia/stitch/ingreso-al-sistema--escritorio.html`
 * (the owner's chosen visual reference): circular brand logo, a flatter
 * single-line error banner, and a title that scales from the mobile
 * headline size up to the desktop's `display-lg` at `md:` — the desktop
 * design is the source, this collapses down to one hand on a narrow
 * screen rather than the other way round. No `person`/`lock` icon inside
 * the fields: `FieldFactory` has no slot for one (see the shared
 * `FIELD_CLASS` note in `PasswordChangeForm`), and forking it for two
 * decorative icons was judged out of proportion — same call the previous
 * batch made.
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
    <main className="relative z-10 flex w-full max-w-form flex-col gap-lg px-margin-mobile">
      <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-surface-container/70 p-md shadow-xl backdrop-blur-md sm:p-lg">
        {bannerMessage && <LoginFormBanner message={bannerMessage} />}

        <div className="mb-md flex flex-col items-center text-center">
          <div className="relative mb-sm h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-surface-container-high p-2 shadow-[0_0_20px_rgba(87,241,219,0.1)]">
            <Image
              src={IMAGES_PATHS.ARENAL_LOGO}
              alt={IMAGE_ALTS.ARENAL_LOGO}
              fill
              className="object-contain drop-shadow-md"
            />
          </div>
          <Title
            variant={TitleVariant.PRIMARY}
            text={ACCESS_LOGIN_SCREEN.APP_NAME}
            className="!text-headline-lg-mobile font-semibold tracking-tight text-primary md:!text-display-lg"
          />
          <Text className="!mt-xs !text-body-base text-on-surface-variant">
            {ACCESS_LOGIN_SCREEN.APP_SUBTITLE}
          </Text>
        </div>

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
            className="mt-sm flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary shadow-md transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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

        <footer className="mt-lg border-t border-white/5 pt-sm text-center">
          <Text className="!text-[11px] text-on-surface-variant/50">
            {ACCESS_LOGIN_SCREEN.FOOTER}
          </Text>
        </footer>
      </div>
    </main>
  );
};

export default LoginForm;
