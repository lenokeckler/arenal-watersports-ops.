import type { ReactNode } from "react";
import type { MaterialIconName } from "@/app/components/icons/material-icon/constants";

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  icon?: MaterialIconName;
}
