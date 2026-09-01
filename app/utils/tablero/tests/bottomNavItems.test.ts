import { describe, expect, it } from "vitest";
import {
  BOTTOM_NAV_ITEM_ID,
  BOTTOM_NAV_SECTION,
  WORK_AREA,
} from "@/app/constants";
import { getBottomNavItemsForArea } from "../bottomNavItems";

describe("getBottomNavItemsForArea", () => {
  it("returns an empty list without an active area", () => {
    expect(
      getBottomNavItemsForArea(
        null,
        BOTTOM_NAV_SECTION.PRIMARY,
        "/tablero"
      )
    ).toEqual([]);
  });

  it("keeps history in the primary bar for administración", () => {
    const items = getBottomNavItemsForArea(
      WORK_AREA.ADMINISTRATION,
      BOTTOM_NAV_SECTION.PRIMARY,
      "/tablero"
    );

    expect(items.map((item) => item.id)).toContain(
      BOTTOM_NAV_ITEM_ID.HISTORY
    );
  });

  it("moves history and prices to the panel for operaciones", () => {
    const primaryItems = getBottomNavItemsForArea(
      WORK_AREA.OPERATIONS,
      BOTTOM_NAV_SECTION.PRIMARY,
      "/operaciones"
    );
    const secondaryItems = getBottomNavItemsForArea(
      WORK_AREA.OPERATIONS,
      BOTTOM_NAV_SECTION.SECONDARY,
      "/operaciones"
    );

    expect(
      primaryItems.map((item) => item.id)
    ).not.toContain(BOTTOM_NAV_ITEM_ID.HISTORY);
    expect(secondaryItems.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        BOTTOM_NAV_ITEM_ID.HISTORY,
        BOTTOM_NAV_ITEM_ID.PRICES,
      ])
    );
  });

  it("keeps every operaciones primary item within the four-tab budget", () => {
    const primaryItems = getBottomNavItemsForArea(
      WORK_AREA.OPERATIONS,
      BOTTOM_NAV_SECTION.PRIMARY,
      "/operaciones"
    );

    expect(primaryItems).toHaveLength(4);
  });

  it("marks the item matching the current path as active", () => {
    const items = getBottomNavItemsForArea(
      WORK_AREA.RESERVATIONS,
      BOTTOM_NAV_SECTION.PRIMARY,
      "/reservas/calendario/semana"
    );
    const calendarItem = items.find(
      (item) => item.id === BOTTOM_NAV_ITEM_ID.CALENDAR
    );

    expect(calendarItem?.isActive).toBe(true);
  });
});
