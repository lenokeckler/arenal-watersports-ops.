"use client";

import React, { useRef } from "react";
import { FormProps } from "./models/FormProps.interface";
import FormField from "./form-field/FormField";
import { useContactForm } from "./hooks/useContactForm";
import {
  Section,
  Title,
  Button,
  Image,
  ReCaptcha,
  Text,
  InlineText,
} from "@/app/components";
import {
  INPUT_TYPES,
  FIELD_STYLES,
  FIELD_IDS,
  STATUS,
  SECTION_ID,
  ARIA_LABEL,
  BUTTON_TYPES,
  BUTTON,
  STRING,
  IS_RECAPTCHA_ENABLED,
  TitleVariant,
  IMAGES_PATHS,
  IMAGE_ALTS,
} from "@/app/constants";
import { ReCAPTCHARef } from "../re-captcha/models/ReCAPTCHAProps.interface";

const ContactForm = ({
  contact_section,
  contactInfo,
}: FormProps) => {
  const recaptchaRef = useRef<ReCAPTCHARef | null>(null);
  const {
    formData,
    isSubmitting,
    submitStatus,
    fieldsError,
    handleChange,
    dialCodeOptions,
    handleSubmit,
    handleCaptchaChange,
  } = useContactForm({
    contact_section,
    contactInfo,
    recaptchaRef,
  });
  const text = contact_section.title;
  const keyword = "contáctanos";
  const index = text
    .toLowerCase()
    .indexOf(keyword.toLowerCase());
  const before = index !== -1 ? text.slice(0, index) : text;
  const match =
    index !== -1
      ? text.slice(index, index + keyword.length)
      : STRING.Empty;
  const after =
    index !== -1
      ? text.slice(index + keyword.length)
      : STRING.Empty;

  return (
    <Section
      id={SECTION_ID.CONTACT}
      ariaLabel={ARIA_LABEL.CONTACT_FORM}
      className="w-full"
    >
      <Image
        src={IMAGES_PATHS.BOTTOM_STRIPES}
        alt={IMAGE_ALTS.LINE_WEB}
        width={1000}
        height={50}
        className="w-full h-auto object-cover mb-8"
      />
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="md:w-1/2 text-left">
          <Title
            variant={TitleVariant.AUXILIAR}
            className="text-5xl font-bold text-dark-blue text-center m-2"
          >
            {before}
            <InlineText className="text-sky-blue">
              {match}
            </InlineText>
            {after}
          </Title>
        </div>

        <div className="md:w-1/2">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="w-full max-w-md mx-auto grid grid-cols-1 gap-4 px-4"
          >
            <Section
              id={SECTION_ID.CONTACT_INPUTS}
              ariaLabel={contact_section.title}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col w-full">
                  <FormField
                    id={FIELD_IDS.NAME}
                    name={FIELD_IDS.NAME}
                    label={contact_section.name}
                    value={formData.name}
                    onChange={handleChange}
                    type={INPUT_TYPES.TEXT}
                    classNameField={
                      FIELD_STYLES.roundedField
                    }
                    error={fieldsError.name}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <FormField
                    id={FIELD_IDS.LAST_NAME}
                    name={FIELD_IDS.LAST_NAME}
                    label={contact_section.last_name}
                    value={formData.last_name}
                    onChange={handleChange}
                    type={INPUT_TYPES.TEXT}
                    classNameField={
                      FIELD_STYLES.roundedField
                    }
                    error={fieldsError.last_name}
                  />
                </div>
              </div>

              <FormField
                id={FIELD_IDS.EMAIL}
                name={FIELD_IDS.EMAIL}
                label={contact_section.email}
                value={formData.email}
                onChange={handleChange}
                type={INPUT_TYPES.EMAIL}
                classNameField={FIELD_STYLES.roundedField}
                error={fieldsError.email}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col w-full">
                  <FormField
                    id={FIELD_IDS.COUNTRY_CODE}
                    name={FIELD_IDS.COUNTRY_CODE}
                    label={contact_section.code_country}
                    value={formData.country_code}
                    onChange={handleChange}
                    type={INPUT_TYPES.SELECT}
                    classNameField={
                      FIELD_STYLES.roundedField
                    }
                    options={dialCodeOptions}
                    placeholder={
                      contact_section.code_country
                    }
                    error={fieldsError.country_code}
                    selectSizeClassName="h-[38px] sm:h-[42px]"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <FormField
                    id={FIELD_IDS.PHONE}
                    name={FIELD_IDS.PHONE}
                    label={contact_section.phone}
                    value={formData.phone}
                    onChange={handleChange}
                    type={INPUT_TYPES.TEL}
                    classNameField={
                      FIELD_STYLES.roundedField
                    }
                    error={fieldsError.phone}
                  />
                </div>
              </div>

              <FormField
                id={FIELD_IDS.MESSAGE}
                name={FIELD_IDS.MESSAGE}
                label={contact_section.message}
                value={formData.message}
                onChange={handleChange}
                type={INPUT_TYPES.TEXTAREA}
                classNameField={FIELD_STYLES.roundedField}
                error={fieldsError.message}
              />
            </Section>

            <div className="flex flex-col justify-between">
              {IS_RECAPTCHA_ENABLED && (
                <div className="mt-2">
                  <ReCaptcha
                    ref={recaptchaRef}
                    onVerifyChange={handleCaptchaChange}
                  />
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-4 flex-wrap text-center">
                {submitStatus === STATUS.SUCCESS && (
                  <Text className="px-4 py-2 rounded text-sm text-green-700 bg-green-100">
                    {contact_section.success_send_email}
                  </Text>
                )}
                {submitStatus === STATUS.ERROR && (
                  <Text className="px-4 py-2 rounded text-sm text-red-700 bg-red-100">
                    {
                      contact_section.error_msg
                        .error_send_email
                    }
                  </Text>
                )}
                {submitStatus === null && (
                  <Text className="px-4 py-2 rounded text-sm opacity-0 select-none">
                    placeholder
                  </Text>
                )}
                <Button
                  variant={BUTTON.PRIMARY}
                  type={BUTTON_TYPES.SUBMIT}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  aria-label={
                    isSubmitting
                      ? ARIA_LABEL.SUBMITING_FORM
                      : ARIA_LABEL.SEND_MESSAGE
                  }
                  className="m-4 w-lg p-5 bg-sky-blue border-sky-blue hover:text-sky-blue hover:bg-sky-blue hover:border-sky-blue"
                >
                  {contact_section.send_button}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Section>
  );
};

export default ContactForm;
