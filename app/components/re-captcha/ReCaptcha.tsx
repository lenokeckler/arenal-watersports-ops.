"use client";
import React, { Suspense, lazy, forwardRef } from "react";
import Spinner from "../spinner/Spinner";
import { useReCAPTCHAViewModel } from "./hooks/useReCAPTCHAViewModel";
import {
  ReCAPTCHAProps,
  ReCAPTCHARef,
} from "./models/ReCAPTCHAProps.interface";
import { DISPLAY_NAME } from "@/app/constants";

const ReCAPTCHA = lazy(
  () => import("react-google-recaptcha")
);

const ReCAPTCHAComponent = forwardRef<
  ReCAPTCHARef,
  ReCAPTCHAProps
>(({ onVerifyChange }, ref) => {
  const {
    containerRef,
    getScaleClass,
    siteKey,
    reCaptchaRef,
    handleRecaptchaChange,
    handleRecaptchaExpired,
  } = useReCAPTCHAViewModel(onVerifyChange, ref);

  return (
    <div
      ref={containerRef}
      className={`w-full relative flex justify-center ${getScaleClass()}`}
    >
      <Suspense
        fallback={
          <div className="absolute inset-0 flex justify-center items-center bg-white z-10">
            <Spinner />
          </div>
        }
      >
        <div className="origin-top-center w-[300px] transition-opacity duration-500 ease-in-out">
          <ReCAPTCHA
            ref={reCaptchaRef}
            sitekey={siteKey}
            onChange={handleRecaptchaChange}
            onExpired={handleRecaptchaExpired}
          />
        </div>
      </Suspense>
    </div>
  );
});

ReCAPTCHAComponent.displayName =
  DISPLAY_NAME.RECAPTCHA_COMPONENT;
export default ReCAPTCHAComponent;
