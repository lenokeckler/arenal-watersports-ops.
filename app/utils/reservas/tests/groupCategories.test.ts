import { describe, expect, it } from "vitest";
import { RESERVATION_TYPE } from "@/app/constants";
import { filterCategoriesForReservationType } from "../groupCategories";

interface FakeCategory {
  guideOnly: boolean;
  id: string;
}

const kayak: FakeCategory = {
  guideOnly: false,
  id: "kayak",
};
const cuadraciclo: FakeCategory = {
  guideOnly: true,
  id: "cuadraciclo",
};
const lancha: FakeCategory = {
  guideOnly: true,
  id: "lancha",
};

describe("filterCategoriesForReservationType", () => {
  it("excludes guide-only categories for a rental — US-RES-008", () => {
    const result = filterCategoriesForReservationType(
      [kayak, cuadraciclo, lancha],
      RESERVATION_TYPE.RENTAL
    );

    expect(result).toEqual([kayak]);
  });

  it("keeps guide-only categories for a tour", () => {
    const result = filterCategoriesForReservationType(
      [kayak, cuadraciclo, lancha],
      RESERVATION_TYPE.TOUR
    );

    expect(result).toEqual([kayak, cuadraciclo, lancha]);
  });

  it("keeps guide-only categories for a combo", () => {
    const result = filterCategoriesForReservationType(
      [kayak, cuadraciclo, lancha],
      RESERVATION_TYPE.COMBO
    );

    expect(result).toEqual([kayak, cuadraciclo, lancha]);
  });
});
