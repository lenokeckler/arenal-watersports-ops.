import { screen } from "@testing-library/react";
import { CATEGORY_DETAIL_SCREEN } from "@/app/constants";

export const createFuelGaugeBarPage = () => {
  const getReadingText = (level: number, max: number) =>
    screen.getByText(
      CATEGORY_DETAIL_SCREEN.FUEL_LEVEL(level, max)
    );

  const getNoReadingText = () =>
    screen.getByText(
      CATEGORY_DETAIL_SCREEN.FUEL_NO_READING
    );

  return {
    getNoReadingText,
    getReadingText,
  };
};
