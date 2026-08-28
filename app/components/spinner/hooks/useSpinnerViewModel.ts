import {
  SPINNER_SIZE,
  SPINNER_SIZE_CLASSES,
  SPINNER_ARIA,
} from "../constants/Spinner.constants";
import { SpinnerProps } from "../models/SpinnerProps.interface";
import { SpinnerViewModel } from "../models/SpinnerViewModel.interface";

export const useSpinnerViewModel = ({
  size = SPINNER_SIZE.MEDIUM,
  fullScreen = false,
  centeredInForm = false,
}: SpinnerProps): SpinnerViewModel => {
  let containerClass = "flex justify-center items-center";

  if (fullScreen) {
    containerClass =
      "fixed inset-0 w-full h-full bg-white bg-opacity-80 z-50 flex justify-center items-center";
  } else if (centeredInForm) {
    containerClass =
      "fixed inset-0 w-full h-full bg-white flex justify-center items-center";
  }

  const spinnerClass = `${SPINNER_SIZE_CLASSES[size]} animate-spin rounded-full border-4 border-t-transparent border-light-blue`;

  return {
    containerClass,
    spinnerClass,
    role: SPINNER_ARIA.ROLE,
    ariaLabel: SPINNER_ARIA.LABEL,
    screenReaderText: SPINNER_ARIA.SCREEN_READER_TEXT,
  };
};
