import type { Nullable } from "@/app/types";
import type { DamageCause } from "@/app/constants";

export interface MachineDamageFormValues {
  cause: Nullable<DamageCause>;
  description: string;
  impactDelta: string;
  takeOutOfService: boolean;
}

export interface MachineDamageViewModel {
  error: Nullable<string>;
  handleCauseChange: (cause: DamageCause) => void;
  handleDescriptionChange: (description: string) => void;
  handleImpactDeltaChange: (impactDelta: string) => void;
  handleSubmit: () => void;
  handleToggleOutOfService: () => void;
  isBusy: boolean;
  values: MachineDamageFormValues;
}
