import { screen } from "@testing-library/react";
import {
  ARIA_ROLE,
  CATEGORY_DETAIL_SCREEN,
  type UsageMetric,
} from "@/app/constants";

export const createUnitCardPage = () => {
  const getFuelNoReadingText = () =>
    screen.getByText(
      CATEGORY_DETAIL_SCREEN.FUEL_NO_READING
    );

  const queryFuelNoReadingText = () =>
    screen.queryByText(
      CATEGORY_DETAIL_SCREEN.FUEL_NO_READING
    );

  const getFuelReadingText = (level: number, max: number) =>
    screen.getByText(
      CATEGORY_DETAIL_SCREEN.FUEL_LEVEL(level, max)
    );

  const getUsageReadingText = (
    metric: UsageMetric,
    total: number
  ) =>
    screen.getByText(
      CATEGORY_DETAIL_SCREEN.USAGE_READING(metric, total)
    );

  const queryUsageReadingText = (
    metric: UsageMetric,
    total: number
  ) =>
    screen.queryByText(
      CATEGORY_DETAIL_SCREEN.USAGE_READING(metric, total)
    );

  const getSelectButton = (code: string) =>
    screen.getByRole(ARIA_ROLE.BUTTON, {
      name: CATEGORY_DETAIL_SCREEN.SELECT_UNIT(code),
    });

  const queryButton = () =>
    screen.queryByRole(ARIA_ROLE.BUTTON);

  return {
    getFuelNoReadingText,
    getFuelReadingText,
    getSelectButton,
    getUsageReadingText,
    queryButton,
    queryFuelNoReadingText,
    queryUsageReadingText,
  };
};
