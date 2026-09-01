import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  STRING,
  UNIT_LIST_SCREEN,
  UNIT_STATUS,
  UNIT_STATUS_LABEL,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { UnitListRow } from "@/app/utils/administracion/units";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface UnitListTableProps {
  categoryId: string;
  hasMotor: boolean;
  rows: UnitListRow[];
}

const NO_ROWS = 0;

const formatFuel = (
  fuelLevel: Nullable<number>,
  fuelMax: number
): string =>
  fuelLevel === null
    ? STRING.N_A
    : `${fuelLevel}/${fuelMax}`;

const formatNumber = (value: Nullable<number>): string =>
  value === null ? STRING.N_A : String(value);

/**
 * The ficha list of a `by_unit` category (US-ADM-016): code, status,
 * gasoline, accumulated usage and the next oil-change threshold — every
 * row links into the ficha where those values and the decommission action
 * live.
 */
const UnitListTable = ({
  categoryId,
  hasMotor,
  rows,
}: UnitListTableProps): JSX.Element => {
  if (rows.length === NO_ROWS) {
    return (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {UNIT_LIST_SCREEN.EMPTY_STATE}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container/40 backdrop-blur-md">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container/50">
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {UNIT_LIST_SCREEN.COLUMN.CODE}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {UNIT_LIST_SCREEN.COLUMN.STATUS}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {UNIT_LIST_SCREEN.COLUMN.FUEL_LEVEL}
            </th>
            {hasMotor && (
              <>
                <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                  {UNIT_LIST_SCREEN.COLUMN.USAGE_TOTAL}
                </th>
                <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                  {UNIT_LIST_SCREEN.COLUMN.NEXT_OIL_CHANGE}
                </th>
              </>
            )}
            <th
              className="px-md py-sm"
              aria-hidden
            />
          </tr>
        </thead>
        <tbody className="font-body-base text-body-base">
          {rows.map((unit) => (
            <tr
              key={unit.id}
              className="border-b border-outline-variant/50 last:border-b-0 hover:bg-on-surface/5"
            >
              <td className="px-md py-sm text-on-surface">
                <Link
                  href={PATHS.ADMIN.UNIT_DETAIL(
                    categoryId,
                    unit.id
                  )}
                  className="hover:text-primary"
                >
                  {unit.code}
                </Link>
              </td>
              <td className="px-md py-sm">
                <Badge
                  className={
                    unit.status === UNIT_STATUS.AVAILABLE
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-error/30 bg-error/10 text-error"
                  }
                >
                  {UNIT_STATUS_LABEL[unit.status]}
                </Badge>
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {formatFuel(unit.fuelLevel, unit.fuelMax)}
              </td>
              {hasMotor && (
                <>
                  <td className="px-md py-sm text-on-surface-variant">
                    {unit.usageTotal}
                  </td>
                  <td className="px-md py-sm text-on-surface-variant">
                    {formatNumber(unit.nextOilChangeAt)}
                  </td>
                </>
              )}
              <td className="px-md py-sm text-right">
                <Link
                  href={PATHS.ADMIN.UNIT_DETAIL(
                    categoryId,
                    unit.id
                  )}
                  className="text-on-surface-variant hover:text-primary"
                >
                  <MaterialIcon
                    name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
                  />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UnitListTable;
