import type { JSX } from "react";
import ReservationDetailHeader from "./components/ReservationDetailHeader";
import ReservationDetailMeta from "./components/ReservationDetailMeta";
import ReservationDetailEquipment from "./components/ReservationDetailEquipment";
import ReservationDetailGuides from "./components/ReservationDetailGuides";
import ReservationDetailPayment from "./components/ReservationDetailPayment";
import type { ReservationDetailProps } from "./models/ReservationDetailProps.interface";

/**
 * `/reservas/detalle/[reservationId]` (US-RES-003). A Server Component,
 * purely presentational — every field already arrives resolved from
 * `fetchReservationDetail`, so there is no client state to own here.
 */
const ReservationDetail = ({
  reservation,
}: ReservationDetailProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <ReservationDetailHeader reservation={reservation} />

    <main className="mx-auto flex max-w-3xl flex-col gap-md">
      <ReservationDetailMeta reservation={reservation} />
      <ReservationDetailEquipment
        items={reservation.items}
      />
      <ReservationDetailGuides
        guideNames={reservation.guideNames}
      />
      <ReservationDetailPayment
        chargeTotals={reservation.chargeTotals}
      />
    </main>
  </div>
);

export default ReservationDetail;
