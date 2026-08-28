import {
  FormProps,
  FormValues,
} from "../components/contact-form/models/FormProps.interface";

export const Validation = (
  values: FormValues,
  formText: FormProps["contact_section"]
): Record<string, string> => {
  const {
    name,
    last_name,
    email,
    phone,
    message,
    country_code,
  } = values;
  const {
    complete_data,
    incorrect_email_format,
    incorrect_phone_format,
    choose_country,
  } = formText.error_msg;
  const newErrors: Record<string, string> = {};
  const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneFormat = /^[0-9]{8,15}$/;

  if (!name) {
    newErrors.name = complete_data;
  }
  if (!last_name) {
    newErrors.last_name = complete_data;
  }
  if (!email) {
    newErrors.email = complete_data;
  }
  if (!phone) {
    newErrors.phone = complete_data;
  }
  if (!message) {
    newErrors.message = complete_data;
  }
  if (email && !emailFormat.test(email)) {
    newErrors.email = incorrect_email_format;
  }
  if (phone && !phoneFormat.test(phone)) {
    newErrors.phone = incorrect_phone_format;
  }
  if (!country_code) {
    newErrors.country_code = choose_country;
  }
  return newErrors;
};
