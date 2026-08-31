import type { JSX } from "react";
import { STRING } from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { BadgeProps } from "./models/BadgeProps.interface";

/**
 * Small status pill shared by the board, category detail, history and
 * inventory screens — one look for "disponible / ocupada / dañada", a
 * reservation type, or a tracking mode, everywhere it appears.
 */
const Badge = ({
  children,
  className = STRING.Empty,
  icon,
}: BadgeProps): JSX.Element => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-sm py-xs font-label-mono text-label-mono uppercase tracking-wider ${className}`}
  >
    {icon && <MaterialIcon name={icon} className="!text-[14px]" />}
    {children}
  </span>
);

export default Badge;
