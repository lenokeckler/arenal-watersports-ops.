import type { JSX } from "react";
import { RESERVATION_DETAIL_SCREEN } from "@/app/constants";
import type { ReservationDetailItem } from "@/app/utils/reservas/reservationDetail";

const NO_ITEMS = 0;

interface ReservationDetailEquipmentProps {
  items: ReservationDetailItem[];
}

/** US-RES-003: every unit, category quantity and extra tied to the salida. */
const ReservationDetailEquipment = ({
  items,
}: ReservationDetailEquipmentProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {RESERVATION_DETAIL_SCREEN.EQUIPMENT.TITLE}
    </h2>

    {items.length === NO_ITEMS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {RESERVATION_DETAIL_SCREEN.EQUIPMENT.EMPTY}
      </p>
    ) : (
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm"
          >
            <span className="font-body-base text-body-base text-on-surface">
              {item.label}
            </span>
            {item.extraName && (
              <span className="font-label-mono text-label-mono text-on-surface-variant">
                {item.extraName}
              </span>
            )}
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default ReservationDetailEquipment;
