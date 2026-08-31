import type { JSX } from "react";
import {
  DAMAGE_CAUSE,
  DAMAGE_CAUSE_LABEL,
  INPUT_TYPES,
  OPERATIONS_NUMBERS,
  RESERVATION_CLOSE_SCREEN,
  type DamageCause,
} from "@/app/constants";
import EquipmentReadingRow from "@/app/components/equipment-reading-row/EquipmentReadingRow";
import type { ReservationCloseEquipmentRow as CloseRow } from "@/app/utils/operaciones/reservationCloseRows";

interface ReservationCloseEquipmentRowProps {
  isBusy: boolean;
  onDamageCauseChange: (
    itemId: string,
    value: DamageCause
  ) => void;
  onDamageDescriptionChange: (
    itemId: string,
    value: string
  ) => void;
  onDamageImpactChange: (
    itemId: string,
    value: string
  ) => void;
  onFuelChange: (itemId: string, value: string) => void;
  onToggleDamage: (itemId: string) => void;
  onUsageChange: (itemId: string, value: string) => void;
  row: CloseRow;
}

const FIELD_CLASS =
  "w-full rounded-lg border border-white/10 bg-surface-container-low p-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** US-OPE-009/US-OPE-013: one returning unit's reading and optional damage report. */
const ReservationCloseEquipmentRow = ({
  isBusy,
  onDamageCauseChange,
  onDamageDescriptionChange,
  onDamageImpactChange,
  onFuelChange,
  onToggleDamage,
  onUsageChange,
  row,
}: ReservationCloseEquipmentRowProps): JSX.Element => (
  <div className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container-high/40 p-md">
    {row.showFuel || row.showUsage ? (
      <EquipmentReadingRow
        fuelLabel={RESERVATION_CLOSE_SCREEN.FUEL_LABEL}
        isDisabled={isBusy}
        onFuelChange={onFuelChange}
        onUsageChange={onUsageChange}
        reading={row}
        usageLabel={RESERVATION_CLOSE_SCREEN.USAGE_LABEL}
      />
    ) : (
      <span className="font-body-base text-body-base text-on-surface">
        {row.unitCode}
      </span>
    )}

    {row.canBeDamaged && (
      <div className="flex flex-col gap-sm">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onToggleDamage(row.itemId)}
          className="self-start rounded-lg border border-error/30 px-sm py-1.5 text-button uppercase text-error"
        >
          {row.isReportingDamage
            ? RESERVATION_CLOSE_SCREEN.DAMAGE.REMOVE
            : RESERVATION_CLOSE_SCREEN.ADD_DAMAGE}
        </button>

        {row.isReportingDamage && (
          <div className="flex flex-col gap-sm rounded-lg border border-error/20 bg-error/5 p-sm">
            <label className="flex flex-col gap-1">
              <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
                {
                  RESERVATION_CLOSE_SCREEN.DAMAGE
                    .CAUSE_LABEL
                }
              </span>
              <select
                value={row.damageCause}
                disabled={isBusy}
                onChange={(event) =>
                  onDamageCauseChange(
                    row.itemId,
                    event.target.value as DamageCause
                  )
                }
                className={FIELD_CLASS}
              >
                <option value="">
                  {
                    RESERVATION_CLOSE_SCREEN.DAMAGE
                      .CAUSE_PLACEHOLDER
                  }
                </option>
                {Object.values(DAMAGE_CAUSE).map(
                  (cause) => (
                    <option
                      key={cause}
                      value={cause}
                    >
                      {DAMAGE_CAUSE_LABEL[cause]}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
                {
                  RESERVATION_CLOSE_SCREEN.DAMAGE
                    .DESCRIPTION_LABEL
                }
              </span>
              <textarea
                rows={3}
                value={row.damageDescription}
                disabled={isBusy}
                placeholder={
                  RESERVATION_CLOSE_SCREEN.DAMAGE
                    .DESCRIPTION_PLACEHOLDER
                }
                onChange={(event) =>
                  onDamageDescriptionChange(
                    row.itemId,
                    event.target.value
                  )
                }
                className={`${FIELD_CLASS} resize-none`}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
                {
                  RESERVATION_CLOSE_SCREEN.DAMAGE
                    .IMPACT_LABEL
                }
              </span>
              <input
                type={INPUT_TYPES.NUMBER}
                min={OPERATIONS_NUMBERS.IMPACT_DELTA_MIN}
                value={row.damageImpactDelta}
                disabled={isBusy}
                onChange={(event) =>
                  onDamageImpactChange(
                    row.itemId,
                    event.target.value
                  )
                }
                className={FIELD_CLASS}
              />
            </label>
          </div>
        )}
      </div>
    )}
  </div>
);

export default ReservationCloseEquipmentRow;
