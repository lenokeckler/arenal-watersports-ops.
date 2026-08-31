import type { ChangeEvent, FormEvent } from "react";
import type { Nullable } from "@/app/types";
import type { WorkArea } from "@/app/constants";

type FieldChangeEvent = ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

export interface WorkerFormViewModel {
  baseRole: WorkArea;
  createdWorkerId: Nullable<string>;
  expiresAt: string;
  formError: Nullable<string>;
  fullName: string;
  fullNameError: Nullable<string>;
  handleBaseRoleChange: (event: FieldChangeEvent) => void;
  handleCopyTemporaryPassword: () => void;
  handleExpiresAtChange: (event: FieldChangeEvent) => void;
  handleFullNameChange: (event: FieldChangeEvent) => void;
  handleIsExternalGuideToggle: (event: FieldChangeEvent) => void;
  handleNationalIdChange: (event: FieldChangeEvent) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleUsernameChange: (event: FieldChangeEvent) => void;
  isExternalGuide: boolean;
  isSubmitting: boolean;
  nationalId: string;
  temporaryPassword: Nullable<string>;
  username: string;
  usernameError: Nullable<string>;
}
