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
import type { PasswordChangeFormHeaderProps } from "./models/PasswordChangeFormHeaderProps.interface";

/**
 * Circular logo + title/subtitle, matching the header of the Stitch login
 * reference (`docs/referencia/stitch/ingreso-al-sistema--movil.html` §213).
 * There is no Stitch design for this screen — this extrapolates the same
 * visual language rather than inventing a new header shape. Local mini,
 * presentation only (`component-architecture` §5).
 */
const PasswordChangeFormHeader = ({
  copy,
}: PasswordChangeFormHeaderProps): JSX.Element => (
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
      text={copy.TITLE}
      className="!text-title-md font-semibold tracking-tight text-primary"
    />
    <Text className="!mt-xs !text-body-base text-on-surface-variant">
      {copy.SUBTITLE}
    </Text>
    <Text className="!mt-1 !text-[12px] text-outline">
      {ACCESS_LOGIN_SCREEN.APP_NAME}
    </Text>
  </div>
);

export default PasswordChangeFormHeader;
