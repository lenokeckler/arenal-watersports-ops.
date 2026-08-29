import type { ChangeEvent, FormEvent } from "react";
import type { Nullable } from "@/app/types";

type FieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

export interface ProfileFormViewModel {
  email: string;
  emailError: Nullable<string>;
  emailLabelSuffix: string;
  emailSuccess: Nullable<string>;
  handleEmailChange: (event: FieldChangeEvent) => void;
  handleEmailSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isAdmin: boolean;
  isSavingEmail: boolean;
}
