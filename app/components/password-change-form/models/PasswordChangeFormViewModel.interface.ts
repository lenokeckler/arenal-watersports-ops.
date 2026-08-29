import type { ChangeEvent, FormEvent } from "react";
import type { Nullable } from "@/app/types";

type FieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

/**
 * Copy that differs between `/acceso/primer-ingreso` and
 * `/acceso/cambio-contrasena` — the two entries of `PASSWORD_CHANGE_SCREEN`
 * keyed by `PASSWORD_CHANGE_MODE` share this exact shape.
 */
export interface PasswordChangeModeCopy {
  BACK_TO_PROFILE?: string;
  CURRENT_PASSWORD_ERROR: string;
  CURRENT_PASSWORD_LABEL: string;
  CURRENT_PASSWORD_PLACEHOLDER: string;
  SUBMIT: string;
  SUBTITLE: string;
  TITLE: string;
}

export interface PasswordChangeFormViewModel {
  confirmPassword: string;
  confirmPasswordError: Nullable<string>;
  copy: PasswordChangeModeCopy;
  currentPassword: string;
  currentPasswordError: Nullable<string>;
  formError: Nullable<string>;
  handleConfirmPasswordChange: (event: FieldChangeEvent) => void;
  handleCurrentPasswordChange: (event: FieldChangeEvent) => void;
  handleNewPasswordChange: (event: FieldChangeEvent) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isFirstLogin: boolean;
  isSubmitting: boolean;
  newPassword: string;
  newPasswordError: Nullable<string>;
  successMessage: Nullable<string>;
}
