import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  OPERATIONS_INVENTORY_SCREEN,
  PATHS,
  type MaterialIconName,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface OperationsInventoryLinksProps {
  alertsCount: number;
}

const NO_ALERTS = 0;

const LINK_CLASS =
  "flex min-h-14 items-center gap-2 rounded-lg border border-white/10 bg-surface-container-low px-md font-button text-button uppercase text-on-surface";

const SECONDARY_LINKS: readonly {
  href: string;
  icon: MaterialIconName;
  label: string;
}[] = [
  {
    href: PATHS.OPERATIONS.COUNTS,
    icon: MATERIAL_ICON_NAME.HISTORY,
    label: OPERATIONS_INVENTORY_SCREEN.LINKS.COUNT_HISTORY,
  },
  {
    href: PATHS.OPERATIONS.MAINTENANCE,
    icon: MATERIAL_ICON_NAME.BUILD,
    label: OPERATIONS_INVENTORY_SCREEN.LINKS.MAINTENANCE,
  },
];

/**
 * The four places the inventory screen leads to: taking a count
 * (US-OPE-023), the counts already taken (US-OPE-024), the alerts
 * (US-OPE-026, US-OPE-027) and the workshop (US-OPE-012, US-OPE-017).
 */
const OperationsInventoryLinks = ({
  alertsCount,
}: OperationsInventoryLinksProps): JSX.Element => (
  <div className="flex flex-col gap-sm">
    <Link
      href={PATHS.OPERATIONS.COUNT_NEW}
      className="flex min-h-14 items-center justify-center gap-2 rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed shadow-md"
    >
      <MaterialIcon name={MATERIAL_ICON_NAME.CHECKLIST} />
      {OPERATIONS_INVENTORY_SCREEN.LINKS.NEW_COUNT}
    </Link>

    {alertsCount > NO_ALERTS && (
      <Link
        href={PATHS.OPERATIONS.INVENTORY_ALERTS}
        className="flex min-h-14 items-center gap-2 rounded-lg border border-error/40 bg-error/10 px-md font-button text-button uppercase text-error"
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.WARNING} />
        {OPERATIONS_INVENTORY_SCREEN.ALERTS_BANNER(
          alertsCount
        )}
      </Link>
    )}

    <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
      <Link
        href={PATHS.OPERATIONS.INVENTORY_ALERTS}
        className={LINK_CLASS}
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.NOTIFICATIONS}
        />
        {OPERATIONS_INVENTORY_SCREEN.LINKS.ALERTS}
      </Link>
      {SECONDARY_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={LINK_CLASS}
        >
          <MaterialIcon name={link.icon} />
          {link.label}
        </Link>
      ))}
    </div>
  </div>
);

export default OperationsInventoryLinks;
