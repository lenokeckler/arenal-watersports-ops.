import type { Nullable } from "@/app/types";
import type {
  AvailableTariffOption,
  TariffListRow,
} from "@/app/utils/administracion/tariffs";

export interface RateFormProps {
  /** Every category + type pair with no tariff yet — `nueva` only. */
  availableOptions: AvailableTariffOption[];
  /** The admin's own worker id — `created_by`/`updated_by` on every write. */
  adminWorkerId: string;
  /** `null` for `/administracion/tarifas/nueva`. */
  tariff: Nullable<TariffListRow>;
}
