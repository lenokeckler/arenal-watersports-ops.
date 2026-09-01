import type { JSX } from "react";
import { NEW_RESERVATION_SCREEN } from "@/app/constants";
import type {
  CandidateUnit,
  ReservableCategory,
} from "@/app/utils/reservas/newReservationData";
import type {
  CategoryAvailability,
  UnitConflict,
} from "@/app/utils/reservas/availabilityQueries";
import { groupByCategoryGroup } from "@/app/utils/reservas/groupCategories";
import { SECTION_CLASS } from "../reservationFormStyles";
import ReservationFormQuantityCategory from "./ReservationFormQuantityCategory";
import ReservationFormUnitCategory from "./ReservationFormUnitCategory";

interface ReservationFormEquipmentProps {
  byQuantityCategories: ReservableCategory[];
  byUnitCategories: ReservableCategory[];
  candidateUnitsByCategory: Record<string, CandidateUnit[]>;
  categoryAvailability: Record<
    string,
    CategoryAvailability
  >;
  equipmentError?: string;
  isBusy: boolean;
  onQuantityChange: (
    categoryId: string,
    quantity: number
  ) => void;
  onToggleUnit: (unitId: string) => void;
  quantities: Record<string, number>;
  /**
   * US-OPE-002: how many units a by-unit category still owes, keyed by
   * category id — only set by the dispatch equipment step, when a
   * quantity-booked category (a jet ski agendada as "2") needs exactly
   * that many concrete units picked before it can go out. Undefined for
   * every other caller, which never caps or counts a unit selection.
   */
  requiredUnitQuantities?: Record<string, number>;
  selectedUnitIds: string[];
  unitConflicts: Record<string, UnitConflict[]>;
}

/** US-RES-007: every reservable category, grouped by how it is tracked. */
const ReservationFormEquipment = ({
  byQuantityCategories,
  byUnitCategories,
  candidateUnitsByCategory,
  categoryAvailability,
  equipmentError,
  isBusy,
  onQuantityChange,
  onToggleUnit,
  quantities,
  requiredUnitQuantities,
  selectedUnitIds,
  unitConflicts,
}: ReservationFormEquipmentProps): JSX.Element => (
  <section className={SECTION_CLASS}>
    <h2 className="font-title-md text-title-md text-on-surface">
      {NEW_RESERVATION_SCREEN.EQUIPMENT.TITLE}
    </h2>

    {equipmentError && (
      <p className="font-label-mono text-label-mono text-error">
        {equipmentError}
      </p>
    )}

    {groupByCategoryGroup(byQuantityCategories).map(
      (group) =>
        group.isGroup ? (
          // Las categorias de un mismo grupo van en un solo bloque: un
          // grupo de siete que lleva dos dobles y tres individuales llena
          // las dos cantidades sin buscarlas en renglones separados.
          <div
            key={group.label}
            className="flex flex-col gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm"
          >
            <span className="font-body-base text-body-base text-on-surface">
              {group.label}
            </span>
            {group.members.map((category) => (
              <ReservationFormQuantityCategory
                key={category.id}
                availability={
                  categoryAvailability[category.id]
                }
                category={category}
                isBusy={isBusy}
                onQuantityChange={onQuantityChange}
                quantity={quantities[category.id] ?? 0}
              />
            ))}
          </div>
        ) : (
          <ReservationFormQuantityCategory
            key={group.members[0].id}
            availability={
              categoryAvailability[group.members[0].id]
            }
            category={group.members[0]}
            isBusy={isBusy}
            onQuantityChange={onQuantityChange}
            quantity={quantities[group.members[0].id] ?? 0}
          />
        )
    )}

    {byUnitCategories.map((category) => (
      <ReservationFormUnitCategory
        key={category.id}
        candidateUnits={
          candidateUnitsByCategory[category.id] ?? []
        }
        category={category}
        isBusy={isBusy}
        onToggleUnit={onToggleUnit}
        requiredQuantity={
          requiredUnitQuantities?.[category.id]
        }
        selectedUnitIds={selectedUnitIds}
        unitConflicts={unitConflicts}
      />
    ))}
  </section>
);

export default ReservationFormEquipment;
