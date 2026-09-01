import type { JSX } from "react";
import {
  FUEL_LEVEL_NUMBERS,
  INPUT_TYPES,
  RESERVATION_CLOSE_SCREEN,
  RESERVATION_NUMBERS,
  USAGE_METRIC_LABEL,
} from "@/app/constants";
import FuelLevelPicker from "@/app/components/fuel-level-picker/FuelLevelPicker";
import { parseReadingValue } from "@/app/utils/reservas/equipmentReadingFields";
import type { EquipmentReadingRowProps } from "./models/EquipmentReadingRowProps.interface";

const HINT_CLASS =
  "font-label-mono text-label-mono text-on-surface-variant";

const INPUT_CLASS =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/**
 * US-OPE-003/US-OPE-009: one motorized/fuel-consuming unit's fuel and/or
 * hours reading, shared by the dispatch sheet (departure) and the close
 * screen (return) — the caller decides which label fits which moment.
 */
const EquipmentReadingRow = ({
  fuelLabel,
  isDisabled,
  onFuelChange,
  onUsageChange,
  reading,
  usageLabel,
}: EquipmentReadingRowProps): JSX.Element => (
  <div className="flex flex-col gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm">
    <span className="font-body-base text-body-base text-on-surface">
      {reading.unitCode}
    </span>
    <div className="flex flex-col gap-sm">
      {reading.showFuel && (
        <div className="flex flex-col gap-sm">
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {fuelLabel}
          </span>
          <FuelLevelPicker
            isDisabled={isDisabled}
            max={reading.fuelMax}
            onSelect={(level) =>
              onFuelChange(reading.itemId, String(level))
            }
            selectedLevel={parseReadingValue(
              reading.fuelLevel
            )}
          />
          <input
            type={INPUT_TYPES.NUMBER}
            min={FUEL_LEVEL_NUMBERS.MIN}
            max={reading.fuelMax}
            value={reading.fuelLevel}
            disabled={isDisabled}
            onChange={(event) =>
              onFuelChange(
                reading.itemId,
                event.target.value
              )
            }
            className={INPUT_CLASS}
          />
          {typeof reading.departureFuel === "number" && (
            <span className={HINT_CLASS}>
              {RESERVATION_CLOSE_SCREEN.DEPARTURE_FUEL(
                reading.departureFuel
              )}
            </span>
          )}
        </div>
      )}
      {reading.showUsage && (
        <label className="flex flex-col gap-1">
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {reading.usageMetric
              ? USAGE_METRIC_LABEL[reading.usageMetric]
              : usageLabel}
          </span>
          <input
            type={INPUT_TYPES.NUMBER}
            // El horometro solo sube. La base lo garantiza con
            // `reservation_items_usage_never_goes_back`; esto evita que
            // el operador se entere hasta despues de darle a cerrar.
            min={
              reading.departureUsage ??
              RESERVATION_NUMBERS.MIN_QUANTITY
            }
            value={reading.usageReading}
            disabled={isDisabled}
            onChange={(event) =>
              onUsageChange(
                reading.itemId,
                event.target.value
              )
            }
            className={INPUT_CLASS}
          />
          {typeof reading.departureUsage === "number" && (
            <span className={HINT_CLASS}>
              {RESERVATION_CLOSE_SCREEN.DEPARTURE_USAGE(
                reading.departureUsage
              )}
            </span>
          )}
        </label>
      )}
    </div>
  </div>
);

export default EquipmentReadingRow;
