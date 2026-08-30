import type { JSX } from "react";
import {
  ADMIN_HUB_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface HubCardConfig {
  description: string;
  href: string;
  icon: (typeof MATERIAL_ICON_NAME)[keyof typeof MATERIAL_ICON_NAME];
  title: string;
}

const CARDS: readonly HubCardConfig[] = [
  {
    description: ADMIN_HUB_SCREEN.WORKERS.DESCRIPTION,
    href: PATHS.ADMIN.WORKERS,
    icon: MATERIAL_ICON_NAME.GROUP,
    title: ADMIN_HUB_SCREEN.WORKERS.TITLE,
  },
  {
    description: ADMIN_HUB_SCREEN.CATEGORIES.DESCRIPTION,
    href: PATHS.ADMIN.CATEGORIES,
    icon: MATERIAL_ICON_NAME.CATEGORY,
    title: ADMIN_HUB_SCREEN.CATEGORIES.TITLE,
  },
  {
    description: ADMIN_HUB_SCREEN.UNITS.DESCRIPTION,
    href: PATHS.ADMIN.UNITS,
    icon: MATERIAL_ICON_NAME.INVENTORY_2,
    title: ADMIN_HUB_SCREEN.UNITS.TITLE,
  },
  {
    description: ADMIN_HUB_SCREEN.EXTRAS.DESCRIPTION,
    href: PATHS.ADMIN.EXTRAS,
    icon: MATERIAL_ICON_NAME.WAVES,
    title: ADMIN_HUB_SCREEN.EXTRAS.TITLE,
  },
];

/**
 * `/administracion` — a small hub over the sections EP-ADM-01 through
 * EP-ADM-04 build so far. Large, well-separated tap targets at every
 * width (US-TAB-005's rule, carried into this module).
 */
const AdminHub = (): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-6xl items-center gap-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container-high">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.ADMIN_PANEL_SETTINGS}
          className="!text-[24px] text-primary"
        />
      </div>
      <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
        {ADMIN_HUB_SCREEN.TITLE}
      </h1>
    </header>

    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-md sm:grid-cols-2">
      {CARDS.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="flex min-h-32 flex-col justify-between gap-md rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md transition-colors hover:bg-surface-container-high/60"
        >
          <div className="flex items-center gap-sm">
            <MaterialIcon
              name={card.icon}
              className="!text-[28px] text-primary"
            />
            <span className="font-title-md text-title-md text-on-surface">
              {card.title}
            </span>
          </div>
          <p className="font-body-base text-body-base text-on-surface-variant">
            {card.description}
          </p>
        </Link>
      ))}
    </main>
  </div>
);

export default AdminHub;
