import { ButtonProps } from "../models/ButtonProps.interface";
import {
  BUTTON,
  SIZE,
  sizeButtonStyle,
  Classes,
} from "../constants";
import { STRING } from "@/app/constants";

export const getButtonClassName = ({
  variant = BUTTON.PRIMARY,
  size = SIZE.MD,
  radius = SIZE.MD,
  disabled = false,
  color,
  className = STRING.Empty,
  isLoading = false,
}: ButtonProps): string => {
  const isDisabled = disabled || isLoading;
  const buttonStyle =
    Classes[variant as keyof typeof Classes] ||
    Classes.primary;
  const buttonSize =
    sizeButtonStyle[size as keyof typeof sizeButtonStyle] ||
    sizeButtonStyle.sm;
  const baseClass =
    "font-semibold transition-colors duration-200 focus:outline-none text-center inline-flex items-center justify-center w-auto max-w-full";
  const variantClass =
    variant !== BUTTON.BASE && !color
      ? buttonStyle
      : STRING.Empty;
  const colorClass = color
    ? `bg-[${color}] text-white hover:brightness-90`
    : STRING.Empty;
  const sizeClass =
    variant !== BUTTON.BASE ? buttonSize : STRING.Empty;
  const radiusClass =
    variant !== BUTTON.BASE
      ? `rounded-${radius}`
      : STRING.Empty;
  const stateClass = isDisabled
    ? "cursor-default"
    : "cursor-pointer";
  if (variant === BUTTON.BASE) {
    return [className, stateClass]
      .filter(Boolean)
      .join(STRING.SPACE);
  } else if (variant === BUTTON.CANCEL) {
    const cancelClass = `
      mt-4 w-full p-3 text-sm sm:text-base 
      bg-red-400 text-white rounded 
      border border-red-400
      hover:!bg-red-300
      hover:text-white 
      hover:border-red-300`;
    return [
      baseClass,
      cancelClass,
      buttonSize,
      radiusClass,
      stateClass,
      className,
    ]
      .filter(Boolean)
      .join(STRING.SPACE);
  } else if (variant === BUTTON.CONFIRM) {
    const confirmClass = `
      mt-4 w-full p-3 text-sm sm:text-base 
      bg-emerald-green text-white rounded 
      border border-emerald-green
      hover:!bg-sky-blue
      hover:text-white 
      hover:border-sky-blue`;

    return [
      baseClass,
      confirmClass,
      buttonSize,
      radiusClass,
      stateClass,
      className,
    ]
      .filter(Boolean)
      .join(STRING.SPACE);
  } else if (variant === BUTTON.CLOSE) {
    const closeClass = `
      mt-4 w-full p-3 text-sm sm:text-base 
      bg-emerald-green text-white rounded 
      border border-emerald-green
      hover:!bg-sky-blue
      hover:text-white 
      hover:border-sky-blue`;

    return [
      baseClass,
      closeClass,
      buttonSize,
      radiusClass,
      stateClass,
      className,
    ]
      .filter(Boolean)
      .join(STRING.SPACE);
  }
  return [
    baseClass,
    colorClass || variantClass,
    sizeClass,
    radiusClass,
    stateClass,
    className,
  ]
    .filter(Boolean)
    .join(STRING.SPACE);
};
