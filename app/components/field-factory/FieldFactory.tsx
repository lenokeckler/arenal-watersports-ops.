"use client";

import React, { forwardRef, useState } from "react";
import { FieldFactoryProps } from "../field-factory/models/FieldFactoryProps.interface";
import {
  STRING,
  INPUT_TYPES,
  DISPLAY_NAME,
  ARIA_LABEL,
  MATERIAL_ICON_NAME,
  BUTTON,
} from "@/app/constants";
import { useFieldFactoryViewModel } from "./hooks/useFieldFactoryViewModel";
import Button from "../button/Button";
import MaterialIcon from "../icons/material-icon/MaterialIcon";

const FieldFactory = forwardRef<
  HTMLInputElement,
  FieldFactoryProps
>(
  (
    {
      id,
      name,
      value,
      type = INPUT_TYPES.TEXT,
      options = [],
      checked,
      placeholder = STRING.Empty,
      baseClassName,
      handleChange,
      readOnly = false,
      disabled = false,
      selectSizeClassName,
      onKeyDown,
      onSearch,
      reference,
      isSearch,
      accept,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);

    const { handleSearchKeyDown, handleOnChangeSearch } =
      useFieldFactoryViewModel(
        onSearch,
        handleChange,
        isSearch
      );

    const toggleVisibility = () => {
      setIsVisible((prev) => !prev);
    };

    switch (type) {
      case INPUT_TYPES.TEXTAREA:
        return (
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={handleChange}
            className={`${baseClassName} resize-none h-[200px]`}
            placeholder={placeholder}
            aria-describedby={`${id}-error`}
            readOnly={readOnly}
            disabled={disabled}
          />
        );

      case INPUT_TYPES.SELECT:
        return (
          <select
            id={id}
            name={name}
            value={value}
            disabled={disabled}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            className={`
              ${baseClassName} 
              ${
                value === STRING.Empty
                  ? "text-zinc-400"
                  : "text-black"
              }
              ${
                selectSizeClassName ||
                "h-[54px] sm:h-[58px]"
              }
            `}
            aria-describedby={`${id}-error`}
          >
            {placeholder && (
              <option
                value={STRING.Empty}
                disabled
                hidden
                className="text-zinc-400"
              >
                {placeholder}
              </option>
            )}
            {options &&
              options.map((option) => (
                <option
                  key={option.key}
                  value={option.value}
                  className="text-black"
                >
                  {option.label}
                </option>
              ))}
          </select>
        );

      case INPUT_TYPES.CHECKBOX:
        return (
          <div className="flex items-start gap-2">
            <input
              id={id}
              name={name}
              type={type}
              checked={checked}
              onChange={handleChange}
              readOnly={readOnly}
              disabled={disabled}
              className="mt-1"
              aria-describedby={`${id}-error`}
            />
            <label
              htmlFor={id}
              className="text-base font-medium"
            >
              {value}
            </label>
          </div>
        );

      case INPUT_TYPES.SEARCH:
        return (
          <input
            id={id}
            name={name}
            value={value}
            onChange={handleOnChangeSearch}
            onKeyDown={handleSearchKeyDown}
            type={INPUT_TYPES.TEXT}
            readOnly={readOnly}
            disabled={disabled}
            className={baseClassName}
            placeholder={placeholder}
            aria-describedby={`${id}-error`}
            ref={reference ?? ref}
          />
        );

      case INPUT_TYPES.FILE:
        return (
          <input
            id={id}
            name={name}
            type={INPUT_TYPES.FILE}
            onChange={handleChange}
            className={baseClassName}
            accept={accept}
            readOnly={readOnly}
            disabled={disabled}
            aria-describedby={`${id}-error`}
            ref={reference ?? ref}
          />
        );

      case INPUT_TYPES.SELECT_SEARCH:
        return (
          <select
            id={id}
            name={name}
            value={value}
            disabled={disabled}
            onChange={handleOnChangeSearch}
            onKeyDown={handleSearchKeyDown}
            className={`
              ${baseClassName} 
              ${value === STRING.Empty ? "text-zinc-400" : "text-black"}
              ${selectSizeClassName || "h-[54px] sm:h-[58px]"}
            `}
            aria-describedby={`${id}-error`}
          >
            {placeholder && (
              <option
                value={STRING.Empty}
                disabled
                hidden
                className="text-zinc-400"
              >
                {placeholder}
              </option>
            )}
            {options &&
              options.map((option) => (
                <option
                  key={option.key}
                  value={option.value}
                  className="text-black"
                >
                  {option.label}
                </option>
              ))}
          </select>
        );

      case INPUT_TYPES.PASSWORD:
        return (
          <div className="relative w-full">
            <input
              id={id}
              name={name}
              value={value}
              onChange={handleChange}
              onKeyDown={onKeyDown}
              type={
                isVisible
                  ? INPUT_TYPES.TEXT
                  : INPUT_TYPES.PASSWORD
              }
              readOnly={readOnly}
              disabled={disabled}
              className={`${baseClassName}`}
              placeholder={placeholder}
              aria-describedby={`${id}-error`}
              ref={ref}
            />
            <Button
              type="button"
              variant={BUTTON.BASE}
              aria-label={ARIA_LABEL.TOGGLE_PASSWORD_VISIBILITY}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center focus:ring-2 focus:ring-sky-blue focus:outline-none cursor-pointer"
              onClick={toggleVisibility}
              tabIndex={0}
            >
              {/*
               * `Icon` (next/image) pointed at `/icons/eye.svg` /
               * `/icons/eye-off.svg`, which never existed under `public/`
               * (there is no `public/icons/` directory at all) and 404'd on
               * every password field in the project. `MaterialIcon` is the
               * self-hosted ligature font already used elsewhere in this
               * module (see `MaterialIcon.tsx`), so it cannot 404 on a bad
               * connection the way a missing static asset can.
               */}
              <MaterialIcon
                name={
                  isVisible
                    ? MATERIAL_ICON_NAME.VISIBILITY_OFF
                    : MATERIAL_ICON_NAME.VISIBILITY
                }
                className="!text-[20px] cursor-pointer"
              />
            </Button>
          </div>
        );

      default:
        return (
          <input
            id={id}
            name={name}
            value={value}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            type={type}
            readOnly={readOnly}
            disabled={disabled}
            className={baseClassName}
            placeholder={placeholder}
            aria-describedby={`${id}-error`}
            ref={ref}
          />
        );
    }
  }
);

FieldFactory.displayName = DISPLAY_NAME.FIELD_FACTORY;

export default FieldFactory;
