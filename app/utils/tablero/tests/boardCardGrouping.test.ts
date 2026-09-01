import { describe, expect, it } from "vitest";
import {
  BOARD_CARD_OCCUPANCY,
  TRACKING_MODE,
} from "@/app/constants";
import type { BoardCategory } from "../board";
import {
  groupBoardCards,
  resolveBoardCardOccupancy,
} from "../boardCardGrouping";

const buildCategory = (
  overrides: Partial<BoardCategory>
): BoardCategory => ({
  free: 0,
  groupName: null,
  id: "category-1",
  imageAlt: "Kayak",
  imageSrc: null,
  imageTreatment: null,
  inUse: 0,
  name: "Kayak individual",
  total: 0,
  trackingMode: TRACKING_MODE.BY_QUANTITY,
  ...overrides,
});

describe("groupBoardCards", () => {
  it("keeps a card with no group as its own card", () => {
    const cards = groupBoardCards([
      buildCategory({ groupName: null, id: "jet-ski" }),
    ]);

    expect(cards).toHaveLength(1);
  });

  it("merges free, total and inUse across categories in the same group", () => {
    const cards = groupBoardCards([
      buildCategory({
        free: 4,
        groupName: "Kayak",
        id: "kayak-individual",
        inUse: 3,
        total: 9,
      }),
      buildCategory({
        free: 1,
        groupName: "Kayak",
        id: "kayak-doble",
        inUse: 1,
        total: 2,
      }),
    ]);

    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      free: 5,
      inUse: 4,
      total: 11,
    });
  });

  it("names the merged card after the group, not the first category", () => {
    const cards = groupBoardCards([
      buildCategory({
        groupName: "Kayak",
        name: "Kayak individual",
      }),
      buildCategory({
        groupName: "Kayak",
        id: "kayak-doble",
        name: "Kayak doble",
      }),
    ]);

    expect(cards[0].name).toBe("Kayak");
  });
});

describe("resolveBoardCardOccupancy", () => {
  it("reads free when nothing is dispatched", () => {
    expect(resolveBoardCardOccupancy(0, 9)).toBe(
      BOARD_CARD_OCCUPANCY.FREE
    );
  });

  it("reads partial when some, but not all, units are out", () => {
    expect(resolveBoardCardOccupancy(3, 9)).toBe(
      BOARD_CARD_OCCUPANCY.PARTIAL
    );
  });

  it("reads full once every unit is out", () => {
    expect(resolveBoardCardOccupancy(9, 9)).toBe(
      BOARD_CARD_OCCUPANCY.FULL
    );
  });

  it("reads free for an empty category instead of full", () => {
    expect(resolveBoardCardOccupancy(0, 0)).toBe(
      BOARD_CARD_OCCUPANCY.FREE
    );
  });
});
