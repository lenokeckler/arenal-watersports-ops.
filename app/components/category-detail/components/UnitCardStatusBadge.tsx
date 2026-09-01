import type { JSX } from "react";
import {
  CATEGORY_DETAIL_SCREEN,
  EQUIPMENT_UNIT_STATUS_BADGE,
  EQUIPMENT_UNIT_STATUS_LABEL,
  MATERIAL_ICON_NAME,
  type EquipmentUnitStatus,
} from "@/app/constants";
import Badge from "@/app/components/badge/Badge";

interface UnitCardStatusBadgeProps {
  isOverdue: boolean;
  status: EquipmentUnitStatus;
}

/**
 * Corner badge for a unit card: the normal per-status read
 * (`EQUIPMENT_UNIT_STATUS_BADGE`), or — once the return time has passed —
 * the same "Vencida" treatment the dispatch board already uses.
 */
const UnitCardStatusBadge = ({
  isOverdue,
  status,
}: UnitCardStatusBadgeProps): JSX.Element => {
  if (isOverdue) {
    return (
      <Badge
        className="absolute right-sm top-sm border-secondary/30 bg-secondary/10 text-secondary"
        icon={MATERIAL_ICON_NAME.WARNING}
      >
        {CATEGORY_DETAIL_SCREEN.OVERDUE_BADGE}
      </Badge>
    );
  }

  const badge = EQUIPMENT_UNIT_STATUS_BADGE[status];
  return (
    <Badge
      className={`absolute right-sm top-sm ${badge.CLASS_NAME}`}
      icon={badge.ICON}
    >
      {EQUIPMENT_UNIT_STATUS_LABEL[status]}
    </Badge>
  );
};

export default UnitCardStatusBadge;
