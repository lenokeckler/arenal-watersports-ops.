"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  API,
  STRING,
  WORK_AREA,
  WORKER_FORM_SCREEN,
  type WorkArea,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import type {
  CreateWorkerRequestBody,
  CreateWorkerResponseData,
} from "@/app/api/administracion/trabajadores/route";
import type { WorkerFormViewModel } from "../models/WorkerFormViewModel.interface";

type FieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

interface CreateWorkerResult {
  data?: CreateWorkerResponseData;
  error?: string;
  field?: string;
  ok: boolean;
}

const createWorker = async (
  body: CreateWorkerRequestBody
): Promise<CreateWorkerResult> => {
  try {
    const response = await fetch(API.ROUTES.WORKERS, {
      body: JSON.stringify(body),
      headers: { [API.HEADERS.CONTENT_TYPE]: API.HEADERS.JSON },
      method: API.METHODS.POST,
    });

    const responseBody = (await response.json().catch(() => null)) as {
      error?: string;
      field?: string;
      temporaryPassword?: string;
      username?: string;
      workerId?: string;
    } | null;

    if (!response.ok || !responseBody) {
      return {
        error: responseBody?.error ?? WORKER_FORM_SCREEN.ERROR.GENERIC,
        field: responseBody?.field,
        ok: false,
      };
    }

    return {
      data: {
        temporaryPassword: responseBody.temporaryPassword ?? STRING.Empty,
        username: responseBody.username ?? STRING.Empty,
        workerId: responseBody.workerId ?? STRING.Empty,
      },
      ok: true,
    };
  } catch {
    return { error: WORKER_FORM_SCREEN.ERROR.GENERIC, ok: false };
  }
};

/**
 * All the logic behind `WorkerForm` (US-ADM-001, US-ADM-005). Posts to
 * `POST /api/administracion/trabajadores`, which is the only place that
 * may write `auth.users` — see that route for why the external-guide shape
 * is re-validated there rather than trusted from this form.
 */
export const useWorkerFormViewModel = (): WorkerFormViewModel => {
  const [fullName, setFullName] = useState<string>(STRING.Empty);
  const [username, setUsername] = useState<string>(STRING.Empty);
  const [baseRole, setBaseRole] = useState<WorkArea>(WORK_AREA.OPERATIONS);
  const [isExternalGuide, setIsExternalGuide] = useState<boolean>(false);
  const [nationalId, setNationalId] = useState<string>(STRING.Empty);
  const [expiresAt, setExpiresAt] = useState<string>(STRING.Empty);

  const [fullNameError, setFullNameError] = useState<Nullable<string>>(null);
  const [usernameError, setUsernameError] = useState<Nullable<string>>(null);
  const [formError, setFormError] = useState<Nullable<string>>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdWorkerId, setCreatedWorkerId] =
    useState<Nullable<string>>(null);
  const [temporaryPassword, setTemporaryPassword] =
    useState<Nullable<string>>(null);

  const clearErrors = (): void => {
    setFullNameError(null);
    setUsernameError(null);
    setFormError(null);
  };

  const handleFullNameChange = (event: FieldChangeEvent): void => {
    setFullName(event.target.value);
    setFullNameError(null);
  };

  const handleUsernameChange = (event: FieldChangeEvent): void => {
    setUsername(event.target.value);
    setUsernameError(null);
  };

  const handleBaseRoleChange = (event: FieldChangeEvent): void => {
    setBaseRole(event.target.value as WorkArea);
  };

  const handleIsExternalGuideToggle = (event: FieldChangeEvent): void => {
    setIsExternalGuide((event.target as HTMLInputElement).checked);
  };

  const handleNationalIdChange = (event: FieldChangeEvent): void => {
    setNationalId(event.target.value);
  };

  const handleExpiresAtChange = (event: FieldChangeEvent): void => {
    setExpiresAt(event.target.value);
  };

  const validate = (): boolean => {
    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError(WORKER_FORM_SCREEN.ERROR.FULL_NAME_REQUIRED);
      isValid = false;
    }
    if (!username.trim()) {
      setUsernameError(WORKER_FORM_SCREEN.ERROR.USERNAME_REQUIRED);
      isValid = false;
    }
    if (isExternalGuide && !nationalId.trim()) {
      setFormError(WORKER_FORM_SCREEN.ERROR.NATIONAL_ID_REQUIRED);
      isValid = false;
    }
    if (isExternalGuide && !expiresAt) {
      setFormError(WORKER_FORM_SCREEN.ERROR.EXPIRY_REQUIRED);
      isValid = false;
    }

    return isValid;
  };

  const submit = async (): Promise<void> => {
    setIsSubmitting(true);

    const result = await createWorker({
      baseRole,
      expiresAt: isExternalGuide ? expiresAt : null,
      fullName: fullName.trim(),
      isExternalGuide,
      nationalId: isExternalGuide ? nationalId.trim() : null,
      username: username.trim().toLowerCase(),
    });

    if (!result.ok || !result.data) {
      if (result.field === "username") {
        setUsernameError(result.error ?? WORKER_FORM_SCREEN.ERROR.GENERIC);
      } else {
        setFormError(result.error ?? WORKER_FORM_SCREEN.ERROR.GENERIC);
      }
      setIsSubmitting(false);
      return;
    }

    setCreatedWorkerId(result.data.workerId);
    setTemporaryPassword(result.data.temporaryPassword);
    setIsSubmitting(false);
  };

  const handleCopyTemporaryPassword = (): void => {
    if (temporaryPassword) {
      void navigator.clipboard.writeText(temporaryPassword);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    clearErrors();

    if (!validate()) {
      return;
    }

    void submit();
  };

  return {
    baseRole,
    createdWorkerId,
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
    handleSubmit,
    handleUsernameChange,
    isExternalGuide,
    isSubmitting,
    nationalId,
    temporaryPassword,
    username,
    usernameError,
  };
};
