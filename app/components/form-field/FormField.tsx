import React from "react";
import { FormFieldProps } from "./models/FormFieldProps.interface";
import FieldFactory from "../field-factory/FieldFactory";
import { STRING, INPUT_TYPES } from "@/app/constants";
import { useFormFieldViewModel } from "./hooks/useFormFieldViewModel";
import Text from "../text/Text";
import InlineText from "../text/InlineText";

const FormField = ({
  id,
  name,
  label,
  value,
  type = INPUT_TYPES.TEXT,
  options = [],
  checked = false,
  placeholder = STRING.Empty,
  classNameField = STRING.Empty,
  onChange,
  onKeyDown,
  error,
  showErrorText = false,
  labelSuffix = STRING.ASTERISK,
  readOnly = false,
  disabled = false,
  selectSizeClassName,
  preventEnterSubmit = false,
  onSearch,
  reference,
  isSearch = false,
}: FormFieldProps) => {
  const { computedClassName, handleChange, handleKeyDown } =
    useFormFieldViewModel({
      value: value ?? STRING.Empty,
      type,
      error,
      classNameField,
      onChange,
      readOnly,
      disabled,
      selectSizeClassName,
      preventEnterSubmit,
    });

  // Combine handleKeyDown with custom onKeyDown handler
  const handleKeyDownCombined = (
    event: React.KeyboardEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) => {
    if (preventEnterSubmit) {
      handleKeyDown(
        event as React.KeyboardEvent<HTMLInputElement>
      );
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  return (
    <div className="w-full">
      {error && showErrorText && (
        <Text className="text-red-500 text-sm mb-2">
          {error}
        </Text>
      )}
      {type !== INPUT_TYPES.CHECKBOX && (
        <label
          htmlFor={id}
          className="block mb-1 font-bold text-sm md:text-base text-light-blue"
        >
          {label}
          {STRING.SPACE}
          <InlineText
            className={"font-bold text-light-blue"}
          >
            {labelSuffix}
          </InlineText>
        </label>
      )}
      <FieldFactory
        id={id}
        name={name}
        value={value}
        type={type}
        options={options}
        checked={checked}
        placeholder={placeholder}
        baseClassName={computedClassName}
        handleChange={handleChange}
        readOnly={readOnly}
        disabled={disabled}
        selectSizeClassName={selectSizeClassName}
        onKeyDown={
          preventEnterSubmit || onKeyDown
            ? handleKeyDownCombined
            : undefined
        }
        onSearch={onSearch}
        reference={reference}
        isSearch={isSearch}
      />
    </div>
  );
};

export default FormField;
