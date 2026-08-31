import type { EquipmentReadingFieldState } from "@/app/utils/reservas/equipmentReadingFields";

export interface EquipmentReadingRowProps {
  fuelLabel: string;
  isDisabled: boolean;
  onFuelChange: (itemId: string, value: string) => void;
  onUsageChange: (itemId: string, value: string) => void;
  reading: EquipmentReadingFieldState;
  usageLabel: string;
}
