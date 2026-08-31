import type { JSX } from "react";
import {
  MACHINE_DETAIL_SCREEN,
  MATERIAL_ICON_NAME,
  USAGE_METRIC_LABEL,
  type UsageMetric,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { MachineServiceStatus } from "@/app/utils/operaciones/machines";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface MachineOilChangeNoticeProps {
  serviceStatus: MachineServiceStatus;
  usageMetric: Nullable<UsageMetric>;
}

const DUE_CLASS =
  "flex items-center gap-2 rounded-lg border border-error/40 bg-error/10 px-sm py-sm font-body-base text-body-base text-error";
const PENDING_CLASS =
  "flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm font-body-base text-body-base text-on-surface-variant";

/**
 * US-OPE-012: the notice fires off `unit_service_status.is_oil_change_due`
 * — the threshold lives on the unit's own ficha and the comparison happens
 * in the database, so nothing here decides when it is time.
 */
const MachineOilChangeNotice = ({
  serviceStatus,
  usageMetric,
}: MachineOilChangeNoticeProps): JSX.Element => {
  const metricLabel = usageMetric
    ? USAGE_METRIC_LABEL[usageMetric].toLowerCase()
    : MACHINE_DETAIL_SCREEN.TELEMETRY.USAGE.toLowerCase();

  if (serviceStatus.isOilChangeDue) {
    return (
      <p className={DUE_CLASS}>
        <MaterialIcon name={MATERIAL_ICON_NAME.WARNING} />
        {MACHINE_DETAIL_SCREEN.OIL_ALERT.DUE}
      </p>
    );
  }

  return (
    <p className={PENDING_CLASS}>
      <MaterialIcon name={MATERIAL_ICON_NAME.OIL_BARREL} />
      {MACHINE_DETAIL_SCREEN.OIL_ALERT.REMAINING(
        String(serviceStatus.remainingUsage),
        metricLabel
      )}
    </p>
  );
};

export default MachineOilChangeNotice;
