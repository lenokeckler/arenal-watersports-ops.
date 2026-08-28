import { STRING } from "@/app/constants";
import { TextProps } from "./models/TextProps.interface";

export const InlineText = ({
  children,
  className = STRING.Empty,
  bold = false,
  ...rest
}: TextProps) => (
  <span
    className={`text-base ${bold ? "font-bold" : ""} ${className}`}
    {...rest}
  >
    {children}
  </span>
);

export default InlineText;
