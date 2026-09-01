import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  FIELD_IDS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  PROFILE_SCREEN,
  SPINNER_SIZE,
  TitleVariant,
} from "@/app/constants";
import Button from "../button/Button";
import FormField from "../form-field/FormField";
import Spinner from "../spinner/Spinner";
import Text from "../text/Text";
import Title from "../title/Title";
import MaterialIcon from "../icons/material-icon/MaterialIcon";
import type { ProfileEmailSectionProps } from "./models/ProfileEmailSectionProps.interface";

const FIELD_CLASS =
  "w-full !rounded-lg !border !border-outline-variant !bg-surface-container/50 !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-primary focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-primary/20";
const FIELD_ERROR_CLASS =
  "w-full !rounded-lg !border !border-error/50 !bg-surface-container/50 !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-error focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-error/20";

/**
 * Personal-email form (US-ACC-005): mandatory on the administration
 * account, optional on every other — `emailLabelSuffix` (from
 * `useProfileFormViewModel`) shows the asterisk only for the account the
 * database also requires it for (`workers_admin_needs_email`), so the form
 * never contradicts what the database already enforces. Local mini,
 * presentation only (`component-architecture` §5).
 */
const ProfileEmailSection = ({
  email,
  emailError,
  emailLabelSuffix,
  emailSuccess,
  handleEmailChange,
  handleEmailSubmit,
  isSavingEmail,
}: ProfileEmailSectionProps): JSX.Element => (
  <section className="flex flex-col gap-sm border-t border-outline-variant pt-md">
    <div className="flex items-center gap-2">
      <MaterialIcon
        name={MATERIAL_ICON_NAME.MAIL}
        className="!text-[20px] text-primary"
      />
      <Title
        variant={TitleVariant.SECONDARY}
        text={PROFILE_SCREEN.EMAIL_SECTION_TITLE}
        className="text-body-base font-semibold text-on-surface"
      />
    </div>

    <Text className="!text-[12px] text-on-surface-variant">
      {PROFILE_SCREEN.EMAIL_HELPER}
    </Text>

    {emailError && (
      <div className="flex items-start gap-sm rounded-lg border border-error/50 bg-error-container/20 p-sm">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.ERROR}
          className="!text-[18px] mt-0.5 text-error"
        />
        <Text className="!text-[13px] text-error">
          {emailError}
        </Text>
      </div>
    )}

    {emailSuccess && (
      <div className="flex items-start gap-sm rounded-lg border border-primary/40 bg-primary/10 p-sm">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.CHECK_CIRCLE}
          className="!text-[18px] mt-0.5 text-primary"
        />
        <Text className="!text-[13px] text-primary">
          {emailSuccess}
        </Text>
      </div>
    )}

    <form
      className="flex flex-col gap-sm"
      onSubmit={handleEmailSubmit}
      noValidate
    >
      <FormField
        id={FIELD_IDS.EMAIL}
        name={FIELD_IDS.EMAIL}
        label={PROFILE_SCREEN.EMAIL_LABEL}
        labelSuffix={emailLabelSuffix}
        type={INPUT_TYPES.EMAIL}
        placeholder={PROFILE_SCREEN.EMAIL_PLACEHOLDER}
        value={email}
        onChange={handleEmailChange}
        error={emailError ?? undefined}
        disabled={isSavingEmail}
        classNameField={emailError ? FIELD_ERROR_CLASS : FIELD_CLASS}
      />

      <Button
        type={BUTTON_TYPES.SUBMIT}
        variant={BUTTON.BASE}
        disabled={isSavingEmail}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary shadow-md transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSavingEmail ? (
          <Spinner size={SPINNER_SIZE.SMALL} />
        ) : (
          <span>{PROFILE_SCREEN.EMAIL_SAVE_BUTTON}</span>
        )}
      </Button>
    </form>
  </section>
);

export default ProfileEmailSection;
