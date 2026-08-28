import type { ReCAPTCHA as ReCAPTCHAType } from "react-google-recaptcha";

export interface ReCAPTCHAViewModel {
  containerRef: React.RefObject<HTMLDivElement>;
  scale: number;
  siteKey: string;
  reCaptchaRef: React.RefObject<ReCAPTCHAType | null>;
  handleRecaptchaChange?: (_token: string | null) => void;
  handleRecaptchaExpired?: () => void;
  getScaleClass: () => string;
}
