import type { JSX } from "react";
import {
  CATEGORIES_SCREEN,
  CATEGORY_STATUS,
  CATEGORY_STATUS_LABEL,
  MATERIAL_ICON_NAME,
  PATHS,
  TRACKING_MODE_LABEL,
} from "@/app/constants";
import type { CategoryListRow } from "@/app/utils/administracion/categories";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface CategoryListTableProps {
  rows: CategoryListRow[];
}

const NO_ROWS = 0;

/**
 * The category listing (US-ADM-012): name, modality, reservable, status —
 * every row links into the edit screen where the full behavior lives.
 */
const CategoryListTable = ({
  rows,
}: CategoryListTableProps): JSX.Element => {
  if (rows.length === NO_ROWS) {
    return (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {CATEGORIES_SCREEN.EMPTY_STATE}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container/40 backdrop-blur-md">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 bg-surface-container/50">
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {CATEGORIES_SCREEN.COLUMN.NAME}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {CATEGORIES_SCREEN.COLUMN.TRACKING_MODE}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {CATEGORIES_SCREEN.COLUMN.RESERVABLE}
            </th>
            <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
              {CATEGORIES_SCREEN.COLUMN.STATUS}
            </th>
            <th
              className="px-md py-sm"
              aria-hidden
            />
          </tr>
        </thead>
        <tbody className="font-body-base text-body-base">
          {rows.map((category) => (
            <tr
              key={category.id}
              className="border-b border-white/5 last:border-b-0 hover:bg-white/5"
            >
              <td className="px-md py-sm text-on-surface">
                <Link
                  href={PATHS.ADMIN.CATEGORY_DETAIL(
                    category.id
                  )}
                  className="hover:text-primary"
                >
                  {category.name}
                </Link>
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {TRACKING_MODE_LABEL[category.trackingMode]}
              </td>
              <td className="px-md py-sm text-on-surface-variant">
                {category.isReservable
                  ? CATEGORIES_SCREEN.RESERVABLE_YES
                  : CATEGORIES_SCREEN.RESERVABLE_NO}
              </td>
              <td className="px-md py-sm">
                <Badge
                  className={
                    category.status ===
                    CATEGORY_STATUS.ACTIVE
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-error/30 bg-error/10 text-error"
                  }
                >
                  {CATEGORY_STATUS_LABEL[category.status]}
                </Badge>
              </td>
              <td className="px-md py-sm text-right">
                <Link
                  href={PATHS.ADMIN.CATEGORY_DETAIL(
                    category.id
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

export default CategoryListTable;
