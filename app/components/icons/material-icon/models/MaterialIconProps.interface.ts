import type { MaterialIconName } from "../constants/MaterialIconName.constants";

export interface MaterialIconProps {
  name: MaterialIconName;
  className?: string;
  ariaHidden?: boolean;
}
