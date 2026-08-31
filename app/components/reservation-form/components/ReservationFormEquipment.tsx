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

    {byQuantityCategories.map((category) => (
      <ReservationFormQuantityCategory
        key={category.id}
        availability={categoryAvailability[category.id]}
        category={category}
        isBusy={isBusy}
        onQuantityChange={onQuantityChange}
        quantity={quantities[category.id] ?? 0}
      />
    ))}

    {byUnitCategories.map((category) => (
      <ReservationFormUnitCategory
        key={category.id}
        candidateUnits={
          candidateUnitsByCategory[category.id] ?? []
        }
        category={category}
        isBusy={isBusy}
        onToggleUnit={onToggleUnit}
        selectedUnitIds={selectedUnitIds}
        unitConflicts={unitConflicts}
      />
    ))}
  </section>
);

export default ReservationFormEquipment;
