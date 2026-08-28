"use client";
import { useState } from "react";
import { STRING } from "@/app/constants";

// Mock interfaces - replace with actual interfaces when available
interface ValidationErrorsProps {
  name?: string;
  email?: string;
  phone?: string;
}

export const useCartViewModel = () => {
  const [validationErrors, setValidationErrors] =
    useState<ValidationErrorsProps>({});
  const validatePersonalData = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ): ValidationErrorsProps => {
    const errors: ValidationErrorsProps = {};

    if (!data.name || data.name.trim() === STRING.Empty) {
      errors.name = "Name is required";
    }

    if (!data.email || data.email.trim() === STRING.Empty) {
      errors.email = "Email is required";
    }

    if (!data.phone || data.phone.trim() === STRING.Empty) {
      errors.phone = "Phone is required";
    }

    return errors;
  };

  return {
    validationErrors,
    setValidationErrors,
    validatePersonalData,
  };
};
