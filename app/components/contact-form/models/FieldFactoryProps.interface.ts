import { OMITTED_PROPS } from "@/app/constants";
import { FormFieldProps } from "./FormFieldProps.interface";

export interface FieldFactoryProps extends Omit<
  FormFieldProps,
  (typeof OMITTED_PROPS)[keyof typeof OMITTED_PROPS]
> {
  baseClassName: string;
  handleChange: (
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) => void;
}
