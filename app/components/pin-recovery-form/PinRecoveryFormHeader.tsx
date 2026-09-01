import type { JSX } from "react";
import {
  ACCESS_LOGIN_SCREEN,
  IMAGES_PATHS,
  IMAGE_ALTS,
  TitleVariant,
} from "@/app/constants";
import Image from "../image/Image";
import Text from "../text/Text";
import Title from "../title/Title";
import type { PinRecoveryFormHeaderProps } from "./models/PinRecoveryFormHeaderProps.interface";

/**
 * Same circular-logo header language as `PasswordChangeFormHeader` — no
 * Stitch design exists for this screen either, so this extrapolates
 * instead of inventing a new header shape. Local mini, presentation only
 * (`component-architecture` §5).
 */
const PinRecoveryFormHeader = ({
  title,
  subtitle,
}: PinRecoveryFormHeaderProps): JSX.Element => (
  <div className="mb-md flex flex-col items-center text-center">
    <div className="relative mb-sm h-20 w-20 overflow-hidden rounded-full border border-outline-variant/50 bg-surface-container-low/50 p-2 shadow-inner">
      <Image
        src={IMAGES_PATHS.ARENAL_LOGO}
        alt={IMAGE_ALTS.ARENAL_LOGO}
        fill
        className="object-contain drop-shadow-md"
      />
    </div>
    <Title
      variant={TitleVariant.PRIMARY}
      text={title}
      className="!text-title-md font-semibold tracking-tight text-primary"
    />
    <Text className="!mt-xs !text-body-base text-on-surface-variant">
      {subtitle}
    </Text>
    <Text className="!mt-1 !text-[12px] text-outline">
      {ACCESS_LOGIN_SCREEN.APP_NAME}
    </Text>
  </div>
);

export default PinRecoveryFormHeader;
