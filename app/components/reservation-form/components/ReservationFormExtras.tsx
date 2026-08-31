import type { JSX } from "react";
import { NEW_RESERVATION_SCREEN } from "@/app/constants";
import type {
  CandidateUnit,
  UnitExtraOption,
} from "@/app/utils/reservas/newReservationData";
import { SECTION_CLASS } from "../reservationFormStyles";

const NO_EXTRAS = 0;

interface ReservationFormExtrasProps {
  candidateUnits: CandidateUnit[];
  extrasByUnit: Record<string, UnitExtraOption[]>;
  isBusy: boolean;
  onToggleExtra: (unitId: string, extraId: string) => void;
  selectedExtraIdsByUnit: Record<string, string[]>;
  selectedUnitIds: string[];
}

/**
 * US-RES-011: only the units actually on this reservation that admit any
 * extra at all — `extra_compatibility` decides that, per unit, not per
 * category, so a lancha and a jet ski selected on the same reservation can
 * offer completely different lists.
 */
const ReservationFormExtras = ({
  candidateUnits,
  extrasByUnit,
  isBusy,
  onToggleExtra,
  selectedExtraIdsByUnit,
  selectedUnitIds,
}: ReservationFormExtrasProps): JSX.Element | null => {
  const unitsWithExtras = selectedUnitIds.filter(
    (unitId) =>
      (extrasByUnit[unitId]?.length ?? NO_EXTRAS) >
      NO_EXTRAS
  );

  if (unitsWithExtras.length === NO_EXTRAS) {
    return null;
  }

  return (
    <section className={SECTION_CLASS}>
      <h2 className="font-title-md text-title-md text-on-surface">
        {NEW_RESERVATION_SCREEN.EXTRAS.TITLE}
      </h2>

      {unitsWithExtras.map((unitId) => {
        const unitCode =
          candidateUnits.find((unit) => unit.id === unitId)
            ?.code ?? unitId;
        const selectedExtraIds =
          selectedExtraIdsByUnit[unitId] ?? [];

        return (
          <div
            key={unitId}
            className="flex flex-col gap-sm rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm"
          >
            <span className="font-body-base text-body-base text-on-surface">
              {unitCode}
            </span>
            <div className="flex flex-wrap gap-xs">
              {extrasByUnit[unitId].map((extra) => {
                const isSelected =
                  selectedExtraIds.includes(extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      onToggleExtra(unitId, extra.id)
                    }
                    className={`flex flex-col items-start gap-0.5 rounded-lg border px-sm py-1 text-left font-label-mono text-label-mono transition-colors disabled:opacity-50 ${
                      isSelected
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-white/10 text-on-surface-variant hover:border-primary/40"
                    }`}
                  >
                    <span>{extra.name}</span>
                    {extra.occupiesCategoryId && (
                      <span className="text-[10px] opacity-70">
                        {
                          NEW_RESERVATION_SCREEN.EXTRAS
                            .OCCUPIES_HINT
                        }
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default ReservationFormExtras;
