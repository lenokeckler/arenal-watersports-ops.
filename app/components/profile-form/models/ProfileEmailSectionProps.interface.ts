import type { ProfileFormViewModel } from "./ProfileFormViewModel.interface";

export type ProfileEmailSectionProps = Pick<
  ProfileFormViewModel,
  | "email"
  | "emailError"
  | "emailLabelSuffix"
  | "emailSuccess"
  | "handleEmailChange"
  | "handleEmailSubmit"
  | "isSavingEmail"
>;
