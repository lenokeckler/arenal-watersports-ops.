import React from "react";
import { SpinnerProps } from "./models/SpinnerProps.interface";
import { useSpinnerViewModel } from "./hooks/useSpinnerViewModel";

const Spinner = (props: SpinnerProps) => {
  const {
    containerClass,
    spinnerClass,
    role,
    ariaLabel,
    screenReaderText,
  } = useSpinnerViewModel(props);

  return (
    <div className={containerClass}>
      <div
        className={spinnerClass}
        role={role}
        aria-label={ariaLabel}
      >
        <span className="sr-only">{screenReaderText}</span>
      </div>
    </div>
  );
};

export default Spinner;
