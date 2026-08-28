import { TextProps } from "./models/TextProps.interface";
import { STRING } from "@/app/constants";

export const Text = ({
  children,
  className = STRING.Empty,
  bold = false,
  ...rest
}: TextProps) => (
  <p
    className={`text-base text-dark-blue ${bold ? "font-bold" : ""} ${className}`}
    {...rest}
  >
    {children}
  </p>
);

export default Text;
