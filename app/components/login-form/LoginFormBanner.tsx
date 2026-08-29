import type { JSX } from "react";
import { ACCESS_LOGIN_SCREEN, MATERIAL_ICON_NAME } from "@/app/constants";
import MaterialIcon from "../icons/material-icon/MaterialIcon";
import Text from "../text/Text";
import type { LoginFormBannerProps } from "./models/LoginFormBannerProps.interface";

/**
 * Banner for the two errors that never come from a submit on this page —
 * `SESSION_EXPIRED` and `BLOCKED_ADMIN` arrive as the `motivo` query
 * param after the proxy redirects here (section 2 of the access module
 * design), so they render above the form instead of next to a field.
 * Local mini, presentation only (`component-architecture` §5).
 */
const LoginFormBanner = ({
  message,
}: LoginFormBannerProps): JSX.Element => (
  <div className="mb-md flex animate-shake items-start gap-sm rounded-lg border border-error/50 bg-error-container/20 p-sm">
    <MaterialIcon
      name={MATERIAL_ICON_NAME.ERROR}
      className="!text-[20px] mt-0.5 text-error"
    />
    <div className="flex-1">
      <Text className="!text-[14px] font-medium text-error">
        {ACCESS_LOGIN_SCREEN.BANNER_TITLE}
      </Text>
      <Text className="!mt-1 !text-[12px] text-error/80">
        {message}
      </Text>
    </div>
  </div>
);

export default LoginFormBanner;
