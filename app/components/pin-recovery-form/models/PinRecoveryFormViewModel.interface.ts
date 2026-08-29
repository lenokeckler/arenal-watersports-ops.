import type { ChangeEvent, FormEvent } from "react";
import type { Nullable } from "@/app/types";
import type { PasswordRecoveryStep } from "@/app/constants";

type FieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

export interface PinRecoveryFormViewModel {
  confirmPassword: string;
  confirmPasswordError: Nullable<string>;
  formError: Nullable<string>;
  handleChangeUsername: () => void;
  handleConfirmPasswordChange: (event: FieldChangeEvent) => void;
  handleNewPasswordChange: (event: FieldChangeEvent) => void;
  handlePinChange: (event: FieldChangeEvent) => void;
  handleRequestPinSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  handleResetPasswordSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  handleUsernameChange: (event: FieldChangeEvent) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  newPassword: string;
  newPasswordError: Nullable<string>;
  pin: string;
  pinError: Nullable<string>;
  step: PasswordRecoveryStep;
  successMessage: Nullable<string>;
  username: string;
  usernameError: Nullable<string>;
}
