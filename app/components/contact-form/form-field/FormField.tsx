import { FormFieldProps } from "../models/FormFieldProps.interface";
import FieldFactory from "@/app/components/field-factory/FieldFactory";
import { createHandleChange } from "@/app/components/contact-form/view-model/ContactFormViewModel";
import { INPUT_TYPES, STRING } from "@/app/constants";

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
  error,
  selectSizeClassName,
}: FormFieldProps) => {
  const handleChange = createHandleChange(onChange);

  const baseClassName = `${classNameField} w-full p-2 text-sm md:text-base  border transition-all duration-200
                  ${error ? "border-red-500 text-red-600" : "border-black text-black"}`;

  return (
    <>
      {type !== INPUT_TYPES.CHECKBOX && (
        <label
          htmlFor={id}
          className={
            "block mb-1 font-medium md:text-base text-[var(--color-dark-blue)]"
          }
        >
          {label}{" "}
          <span className="text-[var(--color-sky-blue)]">
            *
          </span>
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
        baseClassName={baseClassName}
        handleChange={handleChange}
        selectSizeClassName={selectSizeClassName}
      />
    </>
  );
};

export default FormField;
