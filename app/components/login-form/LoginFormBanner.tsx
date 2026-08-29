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
 *
 * Flattened to the single-line style of
 * `ingreso-al-sistema--escritorio.html`'s error banner
 * (`bg-error-container/80 backdrop-blur-md`), keeping the specific message
 * next to the fixed title instead of dropping it: the desktop reference is
 * a static demo string, but this banner reports a real, varying reason
 * (session timed out vs. blocked by administration) that the worker needs
 * to actually read.
 */
const LoginFormBanner = ({
  message,
}: LoginFormBannerProps): JSX.Element => (
  <div
    role="alert"
    className="mb-md flex animate-shake items-center gap-sm rounded-lg border border-error/50 bg-error-container/80 p-sm backdrop-blur-md"
  >
    <MaterialIcon
      name={MATERIAL_ICON_NAME.ERROR}
      className="!text-[20px] text-error"
    />
    <div className="flex-1">
      <Text className="!text-[13px] font-medium text-on-error-container">
        {ACCESS_LOGIN_SCREEN.BANNER_TITLE}
      </Text>
      <Text className="!text-[12px] text-on-error-container/80">
        {message}
      </Text>
    </div>
  </div>
);

export default LoginFormBanner;
