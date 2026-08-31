import type { DamageCause } from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { ReservationCloseEquipmentRow } from "@/app/utils/operaciones/reservationCloseRows";

export interface ReservationCloseViewModel {
  error: Nullable<string>;
  handleDamageCauseChange: (
    itemId: string,
    value: DamageCause
  ) => void;
  handleDamageDescriptionChange: (
    itemId: string,
    value: string
  ) => void;
  handleDamageImpactChange: (
    itemId: string,
    value: string
  ) => void;
  handleFuelChange: (itemId: string, value: string) => void;
  handleSubmit: () => void;
  handleToggleDamage: (itemId: string) => void;
  handleUsageChange: (
    itemId: string,
    value: string
  ) => void;
  isBusy: boolean;
  rows: ReservationCloseEquipmentRow[];
}
