import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ARIA_ROLE,
  FUEL_LEVEL_PICKER_SCREEN,
} from "@/app/constants";

export const createFuelLevelPickerPage = () => {
  const user = userEvent.setup();

  const getLineButton = (line: number, max: number) =>
    screen.getByRole(ARIA_ROLE.BUTTON, {
      name: FUEL_LEVEL_PICKER_SCREEN.LINE_LABEL(line, max),
    });

  const selectLine = async (
    line: number,
    max: number
  ): Promise<void> => {
    await user.click(getLineButton(line, max));
  };

  const isLineFilled = (
    line: number,
    max: number
  ): boolean =>
    getLineButton(line, max).getAttribute(
      "aria-pressed"
    ) === "true";

  return {
    getLineButton,
    isLineFilled,
    selectLine,
  };
};
