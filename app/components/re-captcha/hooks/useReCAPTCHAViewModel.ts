import {
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
} from "react";
import { WINDOW_EVENTS, RECAPTCHA } from "@/app/constants";
import { ReCAPTCHAViewModel } from "../models/ReCAPTCHAViewModel.interface";
import { ReCAPTCHARef } from "../models/ReCAPTCHAProps.interface";
import type { ReCAPTCHA as ReCAPTCHAType } from "react-google-recaptcha";

export const useReCAPTCHAViewModel = (
  onVerifyChange?: (_verified: boolean) => void,
  ref?: React.Ref<ReCAPTCHARef>
): ReCAPTCHAViewModel => {
  const reCaptchaRef = useRef<ReCAPTCHAType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useImperativeHandle(ref, () => ({
    resetCaptcha: () => {
      if (reCaptchaRef.current) {
        setTimeout(
          () => reCaptchaRef.current?.reset(),
          RECAPTCHA.TIME_FOR_RESET
        );
      }
    },
  }));

  const scaleCaptcha = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    const containerWidth = containerRef.current.offsetWidth;
    setScale(
      containerWidth < RECAPTCHA.WIDTH
        ? containerWidth / RECAPTCHA.WIDTH
        : 1
    );
  }, []);

  useLayoutEffect(() => {
    window.addEventListener(
      WINDOW_EVENTS.RESIZE,
      scaleCaptcha
    );
    Promise.resolve().then(() => {
      scaleCaptcha();
    });
    return () =>
      window.removeEventListener(
        WINDOW_EVENTS.RESIZE,
        scaleCaptcha
      );
  }, [scaleCaptcha]);

  const handleRecaptchaChange = (token: string | null) => {
    const verified = !!token;
    if (onVerifyChange) {
      onVerifyChange(verified);
    }
  };

  const handleRecaptchaExpired = () => {
    if (onVerifyChange) {
      onVerifyChange(false);
    }
  };

  const siteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  const getScaleClass = () => {
    switch (scale) {
      case 1:
        return "scale-100 min-h-[78px]";
      case 1.25:
        return "scale-[1.25] min-h-[97.5px]";
      case 1.5:
        return "scale-[1.5] min-h-[117px]";
      default:
        return "scale-100 min-h-[78px]";
    }
  };

  return {
    containerRef:
      containerRef as React.RefObject<HTMLDivElement>,
    scale,
    siteKey,
    reCaptchaRef,
    handleRecaptchaChange,
    handleRecaptchaExpired,
    getScaleClass,
  };
};
