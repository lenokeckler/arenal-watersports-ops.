import type { JSX, ReactNode } from "react";

interface UnitCardFrameProps {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  isSelectable: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

/**
 * US-OPE-002 (tablero entry): an available unit becomes its own tap target
 * when operaciones can dispatch from here — everything else (occupied,
 * damaged, in maintenance, or any other active area) stays the plain
 * display `div` it always was. Keeps that branch out of `UnitCard`'s own
 * return.
 */
const UnitCardFrame = ({
  ariaLabel,
  children,
  className,
  isSelectable,
  isSelected,
  onToggleSelect,
}: UnitCardFrameProps): JSX.Element =>
  isSelectable ? (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      onClick={onToggleSelect}
      className={`${className} text-left`}
    >
      {children}
    </button>
  ) : (
    <div className={className}>{children}</div>
  );

export default UnitCardFrame;
