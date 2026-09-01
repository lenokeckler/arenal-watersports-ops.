import type { JSX } from "react";
import {
  APP_DRAWER_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
  PROFILE_SCREEN,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { BottomNavAreaItem } from "@/app/utils/tablero/bottomNavItems";

interface AppDrawerNavProps {
  items: BottomNavAreaItem[];
  onNavigate: () => void;
}

const NAV_LINK_CLASS =
  "flex min-h-12 items-center gap-3 rounded-lg px-sm transition-colors";

/**
 * Everything the bottom bar had no room for (US-TAB-006), read from the
 * same `BOTTOM_NAV.ITEMS` catalogue `BottomNav` uses for its own tabs, plus
 * the link to `/perfil` — previously reachable from no screen at all.
 * Closes the drawer on navigation so it never sits open over the next
 * screen (component-architecture §5 local mini).
 */
const AppDrawerNav = ({
  items,
  onNavigate,
}: AppDrawerNavProps): JSX.Element => (
  <nav
    aria-label={APP_DRAWER_SCREEN.NAV_ARIA_LABEL}
    className="flex flex-col gap-1 border-b border-outline-variant/50 pb-md"
  >
    {items.length > 0 && (
      <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
        {APP_DRAWER_SCREEN.SECONDARY_NAV_TITLE}
      </span>
    )}
    {items.map((item) => (
      <Link
        key={item.id}
        href={item.href}
        onClick={onNavigate}
        className={`${NAV_LINK_CLASS} ${
          item.isActive
            ? "text-primary"
            : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <MaterialIcon
          name={item.icon}
          className="!text-[20px]"
          ariaHidden
        />
        <span className="font-body-base text-body-base">
          {item.label}
        </span>
      </Link>
    ))}
    <Link
      href={PATHS.COMMON.PROFILE}
      onClick={onNavigate}
      className={`${NAV_LINK_CLASS} mt-1 text-on-surface-variant hover:text-on-surface`}
    >
      <MaterialIcon
        name={MATERIAL_ICON_NAME.PERSON}
        className="!text-[20px]"
        ariaHidden
      />
      <span className="font-body-base text-body-base">
        {PROFILE_SCREEN.TITLE}
      </span>
    </Link>
  </nav>
);

export default AppDrawerNav;
