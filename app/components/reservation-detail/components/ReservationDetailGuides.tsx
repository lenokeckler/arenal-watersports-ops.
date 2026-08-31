import type { JSX } from "react";
import { RESERVATION_DETAIL_SCREEN } from "@/app/constants";

const NO_GUIDES = 0;

interface ReservationDetailGuidesProps {
  guideNames: string[];
}

/** US-RES-003/US-RES-014: who is on this tour, out of a tour or a walk. */
const ReservationDetailGuides = ({
  guideNames,
}: ReservationDetailGuidesProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {RESERVATION_DETAIL_SCREEN.GUIDES.TITLE}
    </h2>

    {guideNames.length === NO_GUIDES ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {RESERVATION_DETAIL_SCREEN.GUIDES.EMPTY}
      </p>
    ) : (
      <ul className="flex flex-wrap gap-sm">
        {guideNames.map((guideName) => (
          <li
            key={guideName}
            className="rounded-full border border-white/10 bg-surface-container-low px-sm py-1 font-body-base text-body-base text-on-surface"
          >
            {guideName}
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default ReservationDetailGuides;
