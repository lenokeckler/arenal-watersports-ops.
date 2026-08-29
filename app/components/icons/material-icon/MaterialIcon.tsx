import type { JSX } from "react";
import { STRING } from "@/app/constants";
import type { MaterialIconProps } from "./models/MaterialIconProps.interface";

/**
 * Renders one Material Symbols Outlined ligature. The base `Icon` component
 * wraps `next/image` and expects an image path or an SVG component, which
 * does not fit a ligature icon font — this is the primitive for that font
 * instead, shared the same way `Icon` is (see `component-standards`).
 */
const MaterialIcon = ({
  name,
  className = STRING.Empty,
  ariaHidden = true,
}: MaterialIconProps): JSX.Element => (
  <span
    aria-hidden={ariaHidden}
    className={`material-symbols-outlined ${className}`}
  >
    {name}
  </span>
);

export default MaterialIcon;
