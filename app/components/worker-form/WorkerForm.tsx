"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  FIELD_IDS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
  WORK_AREA,
  WORK_AREA_LABEL,
  WORKER_FORM_SCREEN,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import FormField from "@/app/components/form-field/FormField";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Spinner from "@/app/components/spinner/Spinner";
import { useWorkerFormViewModel } from "./hooks/useWorkerFormViewModel";
import WorkerFormSuccess from "./WorkerFormSuccess";
import type { WorkerFormProps } from "./models/WorkerFormProps.interface";

/**
 * Dark glass-panel field styling, applied over `FormField` through
 * `classNameField` — same approach `LoginForm` documents (`FIELD_CLASS`)
 * rather than forking the base component.
 */
const FIELD_CLASS =
  "w-full !rounded-lg !border !border-white/10 !bg-surface-container-low !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-primary focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-primary/20";
const FIELD_ERROR_CLASS =
  "w-full !rounded-lg !border !border-error/50 !bg-surface-container-low !p-sm !text-on-surface placeholder:!text-outline-variant focus:!border-error focus:!shadow-none focus:!outline-none focus:!ring-2 focus:!ring-error/20";

const ROLE_OPTIONS = Object.values(WORK_AREA).map((role) => ({
  key: role,
  label: WORK_AREA_LABEL[role],
  value: role,
}));

/**
 * `/administracion/trabajadores/nuevo` and `/reservas/guia-externo/nuevo`
 * (US-ADM-001, US-RES-013). Presentation only — every decision lives in
 * `useWorkerFormViewModel`.
 */
const WorkerForm = ({
  restrictToExternalGuide = false,
}: WorkerFormProps): JSX.Element => {
  const {
    baseRole,
    createdUsername,
    createdWorkerId,
    effectiveUsername,
    expiresAt,
    formError,
    fullName,
    fullNameError,
    handleBaseRoleChange,
    handleCopyTemporaryPassword,
    handleExpiresAtChange,
    handleFullNameChange,
    handleIsExternalGuideToggle,
    handleNationalIdChange,
    handlePersonalEmailChange,
    handleSubmit,
    handleUsernameChange,
    isExternalGuide,
    isSubmitting,
    nationalId,
    personalEmail,
    temporaryPassword,
    username,
    usernameError,
  } = useWorkerFormViewModel({ restrictToExternalGuide });

  if (createdWorkerId && temporaryPassword && createdUsername) {
    return (
      <WorkerFormSuccess
        onCopyTemporaryPassword={handleCopyTemporaryPassword}
        restrictToExternalGuide={restrictToExternalGuide}
        temporaryPassword={temporaryPassword}
        username={createdUsername}
        workerId={createdWorkerId}
      />
    );
  }

  return (
    <form
      className="flex flex-col gap-md rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md"
      onSubmit={handleSubmit}
      noValidate
    >
      {formError && (
        <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
          {formError}
        </p>
      )}

      <FormField
        id={FIELD_IDS.FULL_NAME}
        name={FIELD_IDS.FULL_NAME}
        label={WORKER_FORM_SCREEN.FULL_NAME_LABEL}
        placeholder={WORKER_FORM_SCREEN.FULL_NAME_PLACEHOLDER}
        value={fullName}
        onChange={handleFullNameChange}
        error={fullNameError ?? undefined}
        showErrorText
        disabled={isSubmitting}
        classNameField={fullNameError ? FIELD_ERROR_CLASS : FIELD_CLASS}
      />

      {isExternalGuide ? (
        <div className="flex flex-col gap-xs">
          <FormField
            id={FIELD_IDS.USERNAME}
            name={FIELD_IDS.USERNAME}
            label={WORKER_FORM_SCREEN.USERNAME_LABEL}
            value={effectiveUsername}
            onChange={handleUsernameChange}
            readOnly
            disabled={isSubmitting}
            classNameField={FIELD_CLASS}
          />
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {WORKER_FORM_SCREEN.USERNAME_IS_NATIONAL_ID_HINT}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-xs">
          <FormField
            id={FIELD_IDS.USERNAME}
            name={FIELD_IDS.USERNAME}
            label={WORKER_FORM_SCREEN.USERNAME_LABEL}
            placeholder={WORKER_FORM_SCREEN.USERNAME_PLACEHOLDER}
            value={username}
            onChange={handleUsernameChange}
            error={usernameError ?? undefined}
            showErrorText
            disabled={isSubmitting}
            classNameField={usernameError ? FIELD_ERROR_CLASS : FIELD_CLASS}
          />
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {WORKER_FORM_SCREEN.USERNAME_HINT}
          </span>
        </div>
      )}

      {!restrictToExternalGuide && (
        <FormField
          id={FIELD_IDS.BASE_ROLE}
          name={FIELD_IDS.BASE_ROLE}
          label={WORKER_FORM_SCREEN.ROLE_LABEL}
          type={INPUT_TYPES.SELECT}
          options={ROLE_OPTIONS}
          value={baseRole}
          onChange={handleBaseRoleChange}
          disabled={isSubmitting || isExternalGuide}
          classNameField={FIELD_CLASS}
        />
      )}

      {!restrictToExternalGuide && (
        <label className="flex items-start gap-sm rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm">
          <input
            type={INPUT_TYPES.CHECKBOX}
            checked={isExternalGuide}
            onChange={handleIsExternalGuideToggle}
            disabled={isSubmitting}
            className="mt-1 h-5 w-5"
          />
          <span className="flex flex-col gap-1">
            <span className="font-body-base text-body-base text-on-surface">
              {WORKER_FORM_SCREEN.EXTERNAL_GUIDE_TOGGLE}
            </span>
            <span className="font-label-mono text-label-mono text-on-surface-variant">
              {WORKER_FORM_SCREEN.EXTERNAL_GUIDE_HINT}
            </span>
          </span>
        </label>
      )}

      {isExternalGuide && (
        <>
          <FormField
            id={FIELD_IDS.NATIONAL_ID}
            name={FIELD_IDS.NATIONAL_ID}
            label={WORKER_FORM_SCREEN.NATIONAL_ID_LABEL}
            placeholder={WORKER_FORM_SCREEN.NATIONAL_ID_PLACEHOLDER}
            value={nationalId}
            onChange={handleNationalIdChange}
            disabled={isSubmitting}
            classNameField={FIELD_CLASS}
          />
          <FormField
            id={FIELD_IDS.EXPIRES_AT}
            name={FIELD_IDS.EXPIRES_AT}
            label={WORKER_FORM_SCREEN.EXPIRES_AT_LABEL}
            type={INPUT_TYPES.DATE}
            value={expiresAt}
            onChange={handleExpiresAtChange}
            disabled={isSubmitting}
            classNameField={FIELD_CLASS}
          />
          <FormField
            id={FIELD_IDS.EMAIL}
            name={FIELD_IDS.EMAIL}
            label={WORKER_FORM_SCREEN.PERSONAL_EMAIL_LABEL}
            type={INPUT_TYPES.EMAIL}
            placeholder={WORKER_FORM_SCREEN.PERSONAL_EMAIL_PLACEHOLDER}
            value={personalEmail}
            onChange={handlePersonalEmailChange}
            disabled={isSubmitting}
            classNameField={FIELD_CLASS}
          />
        </>
      )}

      <Button
        type={BUTTON_TYPES.SUBMIT}
        variant={BUTTON.BASE}
        disabled={isSubmitting}
        className="mt-sm flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <Spinner size={SPINNER_SIZE.SMALL} />
        ) : (
          <>
            <span>{WORKER_FORM_SCREEN.SUBMIT}</span>
            <MaterialIcon name={MATERIAL_ICON_NAME.SAVE} className="!text-[18px]" />
          </>
        )}
      </Button>
    </form>
  );
};

export default WorkerForm;
