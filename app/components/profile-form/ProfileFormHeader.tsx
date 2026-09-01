import type { JSX } from "react";
import {
  IMAGES_PATHS,
  IMAGE_ALTS,
  PROFILE_SCREEN,
  STRING,
  TitleVariant,
} from "@/app/constants";
import Image from "../image/Image";
import Text from "../text/Text";
import Title from "../title/Title";
import type { ProfileFormHeaderProps } from "./models/ProfileFormHeaderProps.interface";

/**
 * Logo + worker identity, matching the header language extrapolated for
 * `PasswordChangeFormHeader` (no Stitch design exists for `/perfil` either).
 * Local mini, presentation only (`component-architecture` §5).
 */
const ProfileFormHeader = ({
  areaLabel,
  fullName,
  username,
}: ProfileFormHeaderProps): JSX.Element => (
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
      text={PROFILE_SCREEN.TITLE}
      className="!text-title-md font-semibold tracking-tight text-primary"
    />
    <Text className="!mt-xs !text-body-base text-on-surface">
      {fullName}
    </Text>
    <Text className="!text-[12px] text-on-surface-variant">
      {PROFILE_SCREEN.USERNAME_LABEL}
      {STRING.COLON}
      {STRING.SPACE}
      {username}
    </Text>
    <Text className="!text-[12px] text-on-surface-variant">
      {PROFILE_SCREEN.AREA_LABEL}
      {STRING.COLON}
      {STRING.SPACE}
      {areaLabel}
    </Text>
  </div>
);

export default ProfileFormHeader;
