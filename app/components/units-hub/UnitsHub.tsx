import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  TRACKING_MODE_LABEL,
  UNITS_HUB_SCREEN,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { UnitsHubProps } from "./models/UnitsHubProps.interface";

const NO_CATEGORIES = 0;

/**
 * `/administracion/unidades` (EP-ADM-03). Server Component end to end —
 * every category is a link into the screen its own modality needs, a unit
 * ficha list or the single stock row.
 */
const UnitsHub = ({
  categories,
}: UnitsHubProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-6xl items-center gap-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.INVENTORY_2}
          className="!text-[24px] text-primary"
        />
      </div>
      <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
        {UNITS_HUB_SCREEN.TITLE}
      </h1>
    </header>

    <main className="mx-auto max-w-6xl">
      {categories.length === NO_CATEGORIES ? (
        <p className="font-body-base text-body-base text-on-surface-variant">
          {UNITS_HUB_SCREEN.EMPTY_STATE}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container/40 backdrop-blur-md">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/50">
                <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                  {UNITS_HUB_SCREEN.COLUMN.NAME}
                </th>
                <th className="px-md py-sm font-label-mono text-label-mono uppercase text-on-surface-variant">
                  {UNITS_HUB_SCREEN.COLUMN.TRACKING_MODE}
                </th>
                <th
                  className="px-md py-sm"
                  aria-hidden
                />
              </tr>
            </thead>
            <tbody className="font-body-base text-body-base">
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-outline-variant/50 last:border-b-0 hover:bg-on-surface/5"
                >
                  <td className="px-md py-sm text-on-surface">
                    {category.name}
                  </td>
                  <td className="px-md py-sm text-on-surface-variant">
                    {
                      TRACKING_MODE_LABEL[
                        category.trackingMode
                      ]
                    }
                  </td>
                  <td className="px-md py-sm text-right">
                    <Link
                      href={PATHS.ADMIN.UNIT_CATEGORY(
                        category.id
                      )}
                      className="text-on-surface-variant hover:text-primary"
                    >
                      {UNITS_HUB_SCREEN.MANAGE_LINK}
                      <MaterialIcon
                        name={
                          MATERIAL_ICON_NAME.CHEVRON_RIGHT
                        }
                        className="!text-[18px] align-middle"
                      />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  </div>
);

export default UnitsHub;
