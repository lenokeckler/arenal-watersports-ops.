"use client";

import type { JSX } from "react";
import { BOTTOM_NAV } from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import { useBottomNavViewModel } from "./hooks/useBottomNavViewModel";

/**
 * Fixed bottom bar (US-TAB-004, US-TAB-005): reachable with a thumb from
 * anywhere, one large well-separated tap target per item at every width —
 * this app is used standing up, one-handed, with wet hands. Mounted once
 * in the root layout, like `WorkAreaSwitcher`; renders nothing without an
 * active session or before a work mode is chosen.
 */
const BottomNav = (): JSX.Element | null => {
  const { isVisible, items } = useBottomNavViewModel();

  if (!isVisible) {
    return null;
  }

  return (
    <nav
      aria-label={BOTTOM_NAV.ARIA_LABEL}
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-surface-container/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 py-xs transition-colors ${
            item.isActive
              ? "text-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <MaterialIcon
            name={item.icon}
            className="!text-[24px]"
            ariaHidden
          />
          <span className="font-label-mono text-[10px] uppercase tracking-wider">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
