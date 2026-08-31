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
  selectedUnitIds,
  unitConflicts,
}: ReservationFormUnitCategoryProps): JSX.Element => (
  <div className="flex flex-col gap-sm rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm">
    <span className="font-body-base text-body-base text-on-surface">
      {category.name}
    </span>

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
              disabled={isBusy}
              onClick={() => onToggleUnit(unit.id)}
              className={`rounded-full border px-sm py-1 font-label-mono text-label-mono transition-colors disabled:opacity-50 ${
                isSelected
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-white/10 text-on-surface-variant hover:border-primary/40"
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

export default ReservationFormUnitCategory;
