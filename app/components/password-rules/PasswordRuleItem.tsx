import type { JSX } from "react";
import { MATERIAL_ICON_NAME } from "@/app/constants";
import MaterialIcon from "../icons/material-icon/MaterialIcon";
import Text from "../text/Text";
import type { PasswordRuleItemProps } from "./models/PasswordRuleItemProps.interface";

/**
 * One row of `PasswordRules` — local mini, presentation only
 * (`component-architecture` §5).
 */
const PasswordRuleItem = ({
  isMet,
  label,
}: PasswordRuleItemProps): JSX.Element => (
  <li className="flex items-center gap-xs">
    <MaterialIcon
      name={
        isMet
          ? MATERIAL_ICON_NAME.CHECK_CIRCLE
          : MATERIAL_ICON_NAME.RADIO_BUTTON_UNCHECKED
      }
      className={`!text-[16px] ${isMet ? "text-primary" : "text-on-surface-variant"}`}
    />
    <Text
      className={`!text-[12px] ${isMet ? "text-primary" : "text-on-surface-variant"}`}
    >
      {label}
    </Text>
  </li>
);

export default PasswordRuleItem;
