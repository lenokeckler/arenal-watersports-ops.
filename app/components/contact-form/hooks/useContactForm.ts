"use client";
import { Validation } from "@/app/services/Validation";
import { FormProps } from "../models/FormProps.interface";
import {
  countries,
  CountryInterface,
} from "country-codes-flags-phone-codes";
import {
  STRING,
  FORM_FIELD,
  STATUS,
  API,
  IS_RECAPTCHA_ENABLED,
} from "@/app/constants";
import { useState, useEffect } from "react";
import { Status } from "@/app/constants/strings/Status.types";
import { ReCAPTCHARef } from "../../re-captcha/models/ReCAPTCHAProps.interface";

export const useContactForm = ({
  contact_section,
  contactInfo,
  recaptchaRef,
}: FormProps & {
  recaptchaRef: React.RefObject<ReCAPTCHARef | null>;
}) => {
  const [formData, setFormData] = useState(FORM_FIELD);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] =
    useState<Status | null>(null);
  const [captchaVerified, setCaptchaVerified] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldsError, setFieldsError] = useState<
    Record<string, string>
  >({});
  const [hasSubmittedAttempt, setHasSubmittedAttempt] =
    useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (hasSubmittedAttempt) {
      setFieldsError((prevErrors) => ({
        ...prevErrors,
        [name]: STRING.Empty,
      }));
    }
  };

  const handleCaptchaChange = (isVerified: boolean) => {
    setCaptchaVerified(isVerified);
    if (hasSubmittedAttempt && !isVerified) {
      setFieldsError((prevErrors) => ({
        ...prevErrors,
        captcha: contact_section.error_msg.check_robot,
      }));
    }
  };

  const resetCaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.resetCaptcha();
      setCaptchaVerified(false);
    }
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { checked } = e.target;
    setCaptchaVerified(checked);
    if (hasSubmittedAttempt) {
      if (!checked) {
        setError(contact_section.error_msg.check_robot);
      } else {
        setError(null);
      }
    }
  };

  const dialCodeOptions = countries.map(
    (country: CountryInterface) => ({
      key: `${country.dialCode}-${country.code}`,
      value: country.dialCode,
      label: `${country.name} (${country.dialCode})`,
    })
  );

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setHasSubmittedAttempt(true);

    const newErrors = Validation(formData, contact_section);
    setFieldsError(newErrors);

    let isFormValid = Object.keys(newErrors).length === 0;

    if (!captchaVerified && IS_RECAPTCHA_ENABLED) {
      setError(contact_section.error_msg.check_robot);
      isFormValid = false;
    } else if (isFormValid) {
      setError(null);
    }

    if (!isFormValid) {
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch(API.ROUTES.SEND, {
        method: API.METHODS.POST,
        body: JSON.stringify({
          formData,
          contactEmail: contactInfo.email,
        }),
        headers: {
          [API.HEADERS.CONTENT_TYPE]: API.HEADERS.JSON,
        },
      });

      if (res.ok) {
        resetCaptcha();
        setFormData(FORM_FIELD);
        setSubmitStatus(STATUS.SUCCESS);
        setFieldsError({});
        setHasSubmittedAttempt(false);
        setError(null);
      } else {
        setSubmitStatus(STATUS.ERROR);
      }
    } catch (submitError) {
      if (submitError instanceof Error) {
        setSubmitStatus(submitError.message as Status);
      } else {
        setSubmitStatus(String(submitError) as Status);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (submitStatus) {
      const timer = setTimeout(
        () => setSubmitStatus(null),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  useEffect(() => {
    if (hasSubmittedAttempt) {
      const errorsInCurrentLang = Validation(
        formData,
        contact_section
      );
      setFieldsError((currentVisibleFieldErrors) => {
        const nextVisibleFieldErrors: Record<
          string,
          string
        > = {};

        Object.keys(FORM_FIELD).forEach((fieldKey) => {
          if (
            currentVisibleFieldErrors[fieldKey] &&
            currentVisibleFieldErrors[fieldKey] !==
              STRING.Empty
          ) {
            nextVisibleFieldErrors[fieldKey] =
              errorsInCurrentLang[fieldKey] || STRING.Empty;
          } else {
            nextVisibleFieldErrors[fieldKey] = STRING.Empty;
          }
        });
        return nextVisibleFieldErrors;
      });

      if (!captchaVerified && IS_RECAPTCHA_ENABLED) {
        setError(contact_section.error_msg.check_robot);
      } else {
        setError(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact_section, hasSubmittedAttempt]);

  return {
    formData,
    isSubmitting,
    submitStatus,
    setCaptchaVerified,
    recaptchaRef,
    error,
    fieldsError,
    handleChange,
    handleCheckboxChange,
    dialCodeOptions,
    handleSubmit,
    handleCaptchaChange,
  };
};
