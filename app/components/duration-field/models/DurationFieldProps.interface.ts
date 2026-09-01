import type { Nullable } from "@/app/types";

export interface DurationFieldProps {
  error?: Nullable<string>;
  id: string;
  isDisabled: boolean;
  label: string;
  name: string;
  onChangeMinutes: (minutes: number) => void;
  showErrorText?: boolean;
  valueMinutes: number;
}
