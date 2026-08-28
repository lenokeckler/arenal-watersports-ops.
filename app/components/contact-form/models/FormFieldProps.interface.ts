import { INPUT_TYPES } from "@/app/constants";

export interface FormFieldProps {
  id: string;
  name: string;
  label?: string;
  value: string;
  type?: INPUT_TYPES;
  options?: {
    key: string;
    value: string;
    label: string;
  }[];
  checked?: boolean;
  classNameField?: string;
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (event: React.ChangeEvent<any>) => void;
  error?: string;
  showErrorText?: boolean;
  selectSizeClassName?: string;
}
