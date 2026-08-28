import { HERO_MEDIA_TYPE } from "./HeroSection.constants";

export type HeroMediaType =
  (typeof HERO_MEDIA_TYPE)[keyof typeof HERO_MEDIA_TYPE];

export interface Cover {
  title: [string, string, string, string];
  cover_button: string;
  media_type: HeroMediaType;
}

export interface HeroProps {
  cover: Cover;
}

export interface HeroMediaProps {
  type: HeroMediaType;
}
