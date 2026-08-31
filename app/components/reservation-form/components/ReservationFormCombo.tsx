import type { JSX } from "react";
import {
  COMBO_AUDIENCE_LABEL,
  COMBO_MODE,
  FIELD_IDS,
  INPUT_TYPES,
  NEW_RESERVATION_SCREEN,
  STRING,
  TRACKING_MODE,
  type ComboMode,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import FormField from "@/app/components/form-field/FormField";
import PriceAmounts from "@/app/components/price-amounts/PriceAmounts";
import type {
  CandidateUnit,
  ReservableCombo,
} from "@/app/utils/reservas/newReservationData";
import { SECTION_CLASS } from "../reservationFormStyles";

const NO_COMBOS = 0;

interface ReservationFormComboProps {
  candidateUnitsByCategory: Record<string, CandidateUnit[]>;
  combos: ReservableCombo[];
  comboUnitSelections: Record<string, string[]>;
  isBusy: boolean;
  mode: ComboMode;
  onModeChange: (mode: ComboMode) => void;
  onSelectCombo: (comboId: string) => void;
  onToggleComboUnit: (
    categoryId: string,
    unitId: string,
    requiredQuantity: number
  ) => void;
  selectedCombo: Nullable<ReservableCombo>;
}

const MODE_OPTIONS: readonly {
  label: string;
  value: ComboMode;
}[] = [
  {
    label: NEW_RESERVATION_SCREEN.COMBO.PREDEFINED_MODE,
    value: COMBO_MODE.PREDEFINED,
  },
  {
    label: NEW_RESERVATION_SCREEN.COMBO.CUSTOM_MODE,
    value: COMBO_MODE.CUSTOM,
  },
];

/**
 * US-RES-009: picking a predefined combo — administración's ready-made
 * packages, priced and equipped as a unit. `by_unit` slots (a lancha inside
 * the combo) still need a concrete unit chosen, capped at the quantity the
 * combo asks for; `by_quantity` slots are fixed and only shown, not edited.
 */
const ReservationFormCombo = ({
  candidateUnitsByCategory,
  combos,
  comboUnitSelections,
  isBusy,
  mode,
  onModeChange,
  onSelectCombo,
  onToggleComboUnit,
  selectedCombo,
}: ReservationFormComboProps): JSX.Element => (
  <section className={SECTION_CLASS}>
    <h2 className="font-title-md text-title-md text-on-surface">
      {NEW_RESERVATION_SCREEN.COMBO.TITLE}
    </h2>

    <div className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {NEW_RESERVATION_SCREEN.COMBO.MODE_LABEL}
      </span>
      <div className="flex gap-xs">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={isBusy}
            onClick={() => onModeChange(option.value)}
            className={`rounded-lg border px-sm py-1 font-button text-button transition-colors disabled:opacity-50 ${
              mode === option.value
                ? "border-primary bg-primary/20 text-primary"
                : "border-white/10 text-on-surface-variant hover:border-primary/40"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>

    {mode === COMBO_MODE.PREDEFINED &&
      (combos.length === NO_COMBOS ? (
        <p className="font-label-mono text-label-mono text-on-surface-variant">
          {NEW_RESERVATION_SCREEN.COMBO.EMPTY}
        </p>
      ) : (
        <>
          <FormField
            id={FIELD_IDS.COMBO_SELECT}
            name={FIELD_IDS.COMBO_SELECT}
            label={
              NEW_RESERVATION_SCREEN.COMBO.SELECT_LABEL
            }
            type={INPUT_TYPES.SELECT}
            options={[
              {
                key: STRING.Empty,
                label:
                  NEW_RESERVATION_SCREEN.COMBO
                    .SELECT_PLACEHOLDER,
                value: STRING.Empty,
              },
              ...combos.map((combo) => ({
                key: combo.id,
                // La seccion va en la etiqueta: el mismo paquete existe
                // para nacionales y para extranjeros a distinto precio, y
                // quien toma la reserva tiene que poder distinguirlos.
                label: `${combo.name} — ${COMBO_AUDIENCE_LABEL[combo.audience]}`,
                value: combo.id,
              })),
            ]}
            value={selectedCombo?.id ?? STRING.Empty}
            onChange={(event) =>
              onSelectCombo(event.target.value)
            }
            disabled={isBusy}
          />

          {selectedCombo && (
            <>
              <div className="flex items-center justify-between gap-sm">
                <span className="font-label-mono text-label-mono text-on-surface-variant">
                  {
                    NEW_RESERVATION_SCREEN.COMBO
                      .PACKAGE_PRICE_LABEL
                  }
                </span>
                <PriceAmounts
                  amountCrc={selectedCombo.packagePriceCrc}
                  amountUsd={selectedCombo.packagePriceUsd}
                />
              </div>

              {selectedCombo.items.map((item) => (
                <div
                  key={item.categoryId}
                  className="flex flex-col gap-sm rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm"
                >
                  <div className="flex items-center justify-between gap-sm">
                    <span className="font-body-base text-body-base text-on-surface">
                      {item.categoryName}
                    </span>
                    {item.trackingMode ===
                    TRACKING_MODE.BY_UNIT ? (
                      <span className="font-label-mono text-label-mono text-on-surface-variant">
                        {NEW_RESERVATION_SCREEN.COMBO.UNITS_REMAINING(
                          comboUnitSelections[
                            item.categoryId
                          ]?.length ?? 0,
                          item.quantity
                        )}
                      </span>
                    ) : (
                      <span className="font-label-mono text-label-mono text-on-surface-variant">
                        x{item.quantity}
                      </span>
                    )}
                  </div>

                  {item.trackingMode ===
                    TRACKING_MODE.BY_UNIT && (
                    <div className="flex flex-wrap gap-xs">
                      {(
                        candidateUnitsByCategory[
                          item.categoryId
                        ] ?? []
                      ).map((unit) => {
                        const isSelected = (
                          comboUnitSelections[
                            item.categoryId
                          ] ?? []
                        ).includes(unit.id);
                        return (
                          <button
                            key={unit.id}
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              onToggleComboUnit(
                                item.categoryId,
                                unit.id,
                                item.quantity
                              )
                            }
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
                </div>
              ))}
            </>
          )}
        </>
      ))}
  </section>
);

export default ReservationFormCombo;
