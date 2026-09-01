import type { DurationPreset } from "@/app/constants";
import type { Nullable } from "@/app/types";

export interface DurationFieldViewModel {
  handlePresetSelect: (preset: DurationPreset) => void;
  handleRawMinutesChange: (rawValue: string) => void;
  rawMinutesValue: string;
  readableLabel: string;
  selectedPreset: Nullable<DurationPreset>;
}
