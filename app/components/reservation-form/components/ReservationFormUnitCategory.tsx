import type { JSX } from "react";
import { NEW_RESERVATION_SCREEN } from "@/app/constants";
import { formatShortTime } from "@/app/utils/tablero/formatDateTime";
import type {
  CandidateUnit,
  ReservableCategory,
} from "@/app/utils/reservas/newReservationData";
import type { UnitConflict } from "@/app/utils/reservas/availabilityQueries";

const NO_UNITS = 0;

interface ReservationFormUnitCategoryProps {
  candidateUnits: CandidateUnit[];
  category: ReservableCategory;
  isBusy: boolean;
  onToggleUnit: (unitId: string) => void;
  /**
   * US-OPE-002: how many units this category owes — set only by the
   * dispatch equipment step, converting a quantity-booked category into
   * concrete units. Shows progress and stops offering more units once
   * that count is reached; undefined means no cap, today's Reservas
   * behavior for the lancha.
   */
  requiredQuantity?: number;
  selectedUnitIds: string[];
  unitConflicts: Record<string, UnitConflict[]>;
}

/**
 * US-RES-007/US-RES-016/US-RES-017: pick concrete units by code — only
 * ones already filtered to `available` (US-RES-017) — and warn, without
 * blocking, when a pick collides with another reservation over this
 * franja (US-RES-016).
 */
const ReservationFormUnitCategory = ({
  candidateUnits,
  category,
  isBusy,
  onToggleUnit,
  requiredQuantity,
  selectedUnitIds,
  unitConflicts,
}: ReservationFormUnitCategoryProps): JSX.Element => {
  const selectedCount = candidateUnits.filter((unit) =>
    selectedUnitIds.includes(unit.id)
  ).length;
  const hasReachedRequiredQuantity =
    requiredQuantity !== undefined &&
    selectedCount >= requiredQuantity;

  return (
    <div className="flex flex-col gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm">
      <div className="flex items-center justify-between gap-sm">
        <span className="font-body-base text-body-base text-on-surface">
          {category.name}
        </span>
        {requiredQuantity !== undefined && (
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {NEW_RESERVATION_SCREEN.EQUIPMENT.UNITS_REQUIRED(
              selectedCount,
              requiredQuantity
            )}
          </span>
        )}
      </div>

      {candidateUnits.length === NO_UNITS ? (
        <p className="font-label-mono text-label-mono text-on-surface-variant">
          {NEW_RESERVATION_SCREEN.EQUIPMENT.UNITS_EMPTY}
        </p>
      ) : (
        <div className="flex flex-wrap gap-xs">
          {candidateUnits.map((unit) => {
            const isSelected = selectedUnitIds.includes(
              unit.id
            );
            return (
              <button
                key={unit.id}
                type="button"
                // Un lector de pantalla no ve el borde turquesa: sin esto,
                // que la unidad este elegida o no suena exactamente igual.
                aria-pressed={isSelected}
                disabled={
                  isBusy ||
                  (!isSelected &&
                    hasReachedRequiredQuantity)
                }
                onClick={() => onToggleUnit(unit.id)}
                className={`rounded-full border px-sm py-1 font-label-mono text-label-mono transition-colors disabled:opacity-50 ${
                  isSelected
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-outline-variant text-on-surface-variant hover:border-primary/40"
                }`}
              >
                {unit.code}
              </button>
            );
          })}
        </div>
      )}

      {candidateUnits
        .filter((unit) => selectedUnitIds.includes(unit.id))
        .flatMap((unit) =>
          (unitConflicts[unit.id] ?? []).map((conflict) => (
            <span
              key={`${unit.id}-${conflict.reservationId}`}
              className="font-label-mono text-label-mono text-error"
            >
              {NEW_RESERVATION_SCREEN.EQUIPMENT.UNIT_CONFLICT(
                conflict.code,
                formatShortTime(conflict.startsAt),
                formatShortTime(conflict.endsAt)
              )}
            </span>
          ))
        )}
    </div>
  );
};

export default ReservationFormUnitCategory;
