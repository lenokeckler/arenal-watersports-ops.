import type { JSX } from "react";
import { DISPATCH_STEP } from "@/app/constants";
import type { DispatchEquipmentCatalog } from "@/app/utils/operaciones/dispatchEquipmentCatalog";
import { useDispatchModalFormViewModel } from "./hooks/useDispatchModalFormViewModel";
import DispatchModalEquipmentStep from "./components/DispatchModalEquipmentStep";
import DispatchModalReadingsStep from "./components/DispatchModalReadingsStep";

interface DispatchModalFormProps {
  catalog: DispatchEquipmentCatalog;
  onDispatched: () => void;
  reservationId: string;
  workerId: string;
}

/**
 * US-OPE-002: only mounts once `DispatchModal` has loaded the reservation's
 * current items and the reservable catalog — same ordering constraint as
 * `ReservationEditModalForm`. Each step owns exactly one ViewModel call, so
 * the readings step's row state always initializes from the equipment step's
 * confirmed items instead of an empty list.
 */
const DispatchModalForm = ({
  catalog,
  onDispatched,
  reservationId,
  workerId,
}: DispatchModalFormProps): JSX.Element => {
  const { confirmedItems, handleEquipmentConfirmed, step } =
    useDispatchModalFormViewModel();

  return step === DISPATCH_STEP.EQUIPMENT ? (
    <DispatchModalEquipmentStep
      candidateUnits={catalog.candidateUnits}
      categories={catalog.categories}
      isCombo={catalog.isCombo}
      onConfirmed={handleEquipmentConfirmed}
      originalItems={catalog.originalItems}
      reservationEndsAt={catalog.endsAt}
      reservationId={reservationId}
      reservationStartsAt={catalog.startsAt}
      workerId={workerId}
    />
  ) : (
    <DispatchModalReadingsStep
      items={confirmedItems}
      onDispatched={onDispatched}
      reservationId={reservationId}
      workerId={workerId}
    />
  );
};

export default DispatchModalForm;
