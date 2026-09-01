import type { JSX } from "react";
import {
  MACHINE_DETAIL_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
  UNIT_STATUS_LABEL,
  type UnitStatus,
} from "@/app/constants";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface MachineDetailHeaderProps {
  categoryId: string;
  categoryName: string;
  code: string;
  status: UnitStatus;
}

const BACK_CLASS =
  "flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-primary";

/** The machine's identity: which one it is and where it stands right now. */
const MachineDetailHeader = ({
  categoryId,
  categoryName,
  code,
  status,
}: MachineDetailHeaderProps): JSX.Element => (
  <header className="mx-auto mb-md flex max-w-3xl items-center gap-sm">
    <Link
      href={PATHS.OPERATIONS.INVENTORY_CATEGORY(categoryId)}
      aria-label={MACHINE_DETAIL_SCREEN.BACK}
      className={BACK_CLASS}
    >
      <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_BACK} />
    </Link>

    <div className="flex flex-col gap-1">
      <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
        {code}
      </h1>
      <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
        {categoryName}
      </span>
    </div>

    <Badge className="ml-auto border-outline-variant text-on-surface-variant">
      {UNIT_STATUS_LABEL[status]}
    </Badge>
  </header>
);

export default MachineDetailHeader;
