import {
  STRING,
  INPUT_TYPES,
  KEYBOARD,
} from "@/app/constants";
import React from "react";
import { FormFieldViewModel } from "../models/FormFieldViewModel.interface";

export const useFormFieldViewModel = ({
  value,
  type = INPUT_TYPES.TEXT,
  error,
  classNameField = STRING.Empty,
  onChange,
  readOnly = false,
  disabled = false,
  preventEnterSubmit = false,
}: FormFieldViewModel & {
  readOnly?: boolean;
  disabled?: boolean;
  selectSizeClassName?: string;
}) => {
  const isValidDate = (dateString: string) => {
    if (!dateString) {
      return false;
    }
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const textColorClass =
    type === INPUT_TYPES.DATE && !isValidDate(value)
      ? "text-zinc-400"
      : "text-black";

  const baseClassName = `
    ${classNameField}
    bg-white
    placeholder-zinc-400
    rounded-2xl
    w-full
    p-4
    text-sm md:text-base
    border
    ${error ? "border-red-500 text-red-600" : `border-black ${textColorClass}`}
    ${
      !readOnly && !disabled
        ? "transition-all duration-200 hover:shadow-[inset_0_0_0_1px_black] focus:shadow-[inset_0_0_0_1px_black]"
        : "transition-none hover:none focus:none pointer-events-none"
    }
    ${error && !readOnly && !disabled ? "hover:shadow-[inset_0_0_0_1px_red] focus:shadow-[inset_0_0_0_1px_red]" : STRING.Empty}
  `;

  const computedClassName = `
    ${baseClassName}
    ${readOnly ? "bg-gray-100 cursor-default" : STRING.Empty}
    ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : STRING.Empty}
  `;

  const handleChange = (
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) => {
    if (!readOnly && !disabled) {
      onChange(event);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      preventEnterSubmit &&
      event.key === KEYBOARD.ENTER
    ) {
      event.preventDefault();
    }
  };

  return {
    computedClassName,
    handleChange,
    handleKeyDown,
  };
};
