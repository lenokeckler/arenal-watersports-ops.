import type { ChangeEvent, FormEvent } from "react";
import type { Nullable } from "@/app/types";

export interface LoginFormViewModel {
  bannerMessage: Nullable<string>;
  handlePasswordChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleUsernameChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  isSubmitting: boolean;
  password: string;
  passwordError: Nullable<string>;
  username: string;
  usernameError: Nullable<string>;
}
