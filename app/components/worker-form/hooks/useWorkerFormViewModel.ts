"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
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

const USERNAME_WHITESPACE = /\s+/g;

/**
 * US-RES-013: "el nombre de usuario es la cédula, porque ya está
 * registrada, es única y alguien que viene una semana no va a recordar un
 * usuario inventado" — applies the moment `isExternalGuide` is true,
 * whether that came from administración's toggle or from the reservas-only
 * restricted flow. `workers_username_format` only requires lowercase,
 * trimmed, 3–40 characters; a cédula already satisfies the length, this
 * only normalizes case and strips incidental whitespace.
 */
const deriveUsernameFromNationalId = (
  nationalId: string
): string =>
  nationalId
    .trim()
    .toLowerCase()
    .replace(USERNAME_WHITESPACE, "");

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
      headers: {
        [API.HEADERS.CONTENT_TYPE]: API.HEADERS.JSON,
      },
      method: API.METHODS.POST,
    });

    const responseBody = (await response
      .json()
      .catch(() => null)) as {
      error?: string;
      field?: string;
      temporaryPassword?: string;
      username?: string;
      workerId?: string;
    } | null;

    if (!response.ok || !responseBody) {
      return {
        error:
          responseBody?.error ??
          WORKER_FORM_SCREEN.ERROR.GENERIC,
        field: responseBody?.field,
        ok: false,
      };
    }

    return {
      data: {
        temporaryPassword:
          responseBody.temporaryPassword ?? STRING.Empty,
        username: responseBody.username ?? STRING.Empty,
        workerId: responseBody.workerId ?? STRING.Empty,
      },
      ok: true,
    };
  } catch {
    return {
      error: WORKER_FORM_SCREEN.ERROR.GENERIC,
      ok: false,
    };
  }
};

export interface UseWorkerFormViewModelParams {
  /**
   * US-RES-013: reservas with `registro_guias_externos` can only ever
   * create the temporary external-guide shape — the role picker and the
   * toggle disappear, and `isExternalGuide` starts (and stays) `true`.
   */
  restrictToExternalGuide?: boolean;
}

/**
 * All the logic behind `WorkerForm` (US-ADM-001, US-ADM-005, US-RES-013).
 * Posts to `POST /api/administracion/trabajadores`, which is the only
 * place that may write `auth.users` — see that route for why the
 * external-guide shape is re-validated there rather than trusted from
 * this form.
 */
export const useWorkerFormViewModel = ({
  restrictToExternalGuide = false,
}: UseWorkerFormViewModelParams = {}): WorkerFormViewModel => {
  const [fullName, setFullName] = useState<string>(
    STRING.Empty
  );
  const [username, setUsername] = useState<string>(
    STRING.Empty
  );
  const [baseRole, setBaseRole] = useState<WorkArea>(
    WORK_AREA.OPERATIONS
  );
  const [isExternalGuide, setIsExternalGuide] =
    useState<boolean>(restrictToExternalGuide);
  const [nationalId, setNationalId] = useState<string>(
    STRING.Empty
  );
  const [expiresAt, setExpiresAt] = useState<string>(
    STRING.Empty
  );
  const [personalEmail, setPersonalEmail] =
    useState<string>(STRING.Empty);

  const [fullNameError, setFullNameError] =
    useState<Nullable<string>>(null);
  const [usernameError, setUsernameError] =
    useState<Nullable<string>>(null);
  const [formError, setFormError] =
    useState<Nullable<string>>(null);

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);
  const [createdUsername, setCreatedUsername] =
    useState<Nullable<string>>(null);
  const [createdWorkerId, setCreatedWorkerId] =
    useState<Nullable<string>>(null);
  const [temporaryPassword, setTemporaryPassword] =
    useState<Nullable<string>>(null);

  const effectiveUsername = isExternalGuide
    ? deriveUsernameFromNationalId(nationalId)
    : username;

  const clearErrors = (): void => {
    setFullNameError(null);
    setUsernameError(null);
    setFormError(null);
  };

  const handleFullNameChange = (
    event: FieldChangeEvent
  ): void => {
    setFullName(event.target.value);
    setFullNameError(null);
  };

  const handleUsernameChange = (
    event: FieldChangeEvent
  ): void => {
    setUsername(event.target.value);
    setUsernameError(null);
  };

  const handleBaseRoleChange = (
    event: FieldChangeEvent
  ): void => {
    setBaseRole(event.target.value as WorkArea);
  };

  const handleIsExternalGuideToggle = (
    event: FieldChangeEvent
  ): void => {
    setIsExternalGuide(
      (event.target as HTMLInputElement).checked
    );
  };

  const handleNationalIdChange = (
    event: FieldChangeEvent
  ): void => {
    setNationalId(event.target.value);
  };

  const handleExpiresAtChange = (
    event: FieldChangeEvent
  ): void => {
    setExpiresAt(event.target.value);
  };

  const handlePersonalEmailChange = (
    event: FieldChangeEvent
  ): void => {
    setPersonalEmail(event.target.value);
  };

  const validate = (): boolean => {
    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError(
        WORKER_FORM_SCREEN.ERROR.FULL_NAME_REQUIRED
      );
      isValid = false;
    }
    if (!isExternalGuide && !username.trim()) {
      setUsernameError(
        WORKER_FORM_SCREEN.ERROR.USERNAME_REQUIRED
      );
      isValid = false;
    }
    if (isExternalGuide && !nationalId.trim()) {
      setFormError(
        WORKER_FORM_SCREEN.ERROR.NATIONAL_ID_REQUIRED
      );
      isValid = false;
    }
    if (isExternalGuide && !expiresAt) {
      setFormError(
        WORKER_FORM_SCREEN.ERROR.EXPIRY_REQUIRED
      );
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
      nationalId: isExternalGuide
        ? nationalId.trim()
        : null,
      personalEmail: personalEmail.trim() || null,
      username: effectiveUsername,
    });

    if (!result.ok || !result.data) {
      if (result.field === "username") {
        setUsernameError(
          result.error ?? WORKER_FORM_SCREEN.ERROR.GENERIC
        );
      } else {
        setFormError(
          result.error ?? WORKER_FORM_SCREEN.ERROR.GENERIC
        );
      }
      setIsSubmitting(false);
      return;
    }

    setCreatedUsername(result.data.username);
    setCreatedWorkerId(result.data.workerId);
    setTemporaryPassword(result.data.temporaryPassword);
    setIsSubmitting(false);
  };

  const handleCopyTemporaryPassword = (): void => {
    if (temporaryPassword) {
      void navigator.clipboard.writeText(temporaryPassword);
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    clearErrors();

    if (!validate()) {
      return;
    }

    void submit();
  };

  return {
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
  };
};
