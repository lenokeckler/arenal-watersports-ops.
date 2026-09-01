import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ARIA_ROLE,
  DURATION_PRESET_LABEL,
  type DurationPreset,
} from "@/app/constants";

const CUSTOM_FIELD_LABEL_PATTERN = /otra duración/i;
const CAPTION_TEXT_PATTERN = /^Duración:/;

export const createDurationFieldPage = () => {
  const user = userEvent.setup();

  const getPresetButton = (preset: DurationPreset) =>
    screen.getByRole(ARIA_ROLE.BUTTON, {
      name: DURATION_PRESET_LABEL[preset],
    });

  const getCustomMinutesInput = () =>
    screen.getByLabelText(CUSTOM_FIELD_LABEL_PATTERN);

  const getCaption = () =>
    screen.getByText(CAPTION_TEXT_PATTERN);

  const selectPreset = async (
    preset: DurationPreset
  ): Promise<void> => {
    await user.click(getPresetButton(preset));
  };

  const typeCustomMinutes = async (
    value: string
  ): Promise<void> => {
    const input = getCustomMinutesInput();
    await user.clear(input);
    await user.type(input, value);
  };

  const isPresetSelected = (
    preset: DurationPreset
  ): boolean =>
    getPresetButton(preset).getAttribute("aria-pressed") ===
    "true";

  return {
    getCaption,
    getCustomMinutesInput,
    getPresetButton,
    isPresetSelected,
    selectPreset,
    typeCustomMinutes,
  };
};
