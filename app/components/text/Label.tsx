import { STRING } from "@/app/constants";
import { LabelProps } from "./models/LabelProps.interface";

export const Label = ({
  children,
  className = STRING.Empty,
  bold = false,
  ...rest
}: LabelProps) => (
  <label
    className={`text-sm ${bold ? "font-bold" : "font-medium"} text-gray-800 ${className}`}
    {...rest}
  >
    {children}
  </label>
);

export default Label;
