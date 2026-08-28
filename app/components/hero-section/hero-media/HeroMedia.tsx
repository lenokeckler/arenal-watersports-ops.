import HeroImage from "./HeroImage";
import HeroVideo from "./HeroVideo";
import { HERO_MEDIA_TYPE } from "@/app/components/hero-section/HeroSection.constants";
import { HeroMediaProps } from "@/app/components/hero-section/HeroSectionProps.interface";

const mediaComponentMap = {
  [HERO_MEDIA_TYPE.IMAGE]: HeroImage,
  [HERO_MEDIA_TYPE.VIDEO]: HeroVideo,
};

const HeroMedia = ({ type }: HeroMediaProps) => {
  const MediaComponent = mediaComponentMap[type];
  return MediaComponent ? <MediaComponent /> : null;
};

export default HeroMedia;
