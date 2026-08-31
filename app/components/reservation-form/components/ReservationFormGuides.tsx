import type { JSX } from "react";
import { NEW_RESERVATION_SCREEN } from "@/app/constants";
import type { Guide } from "@/app/utils/reservas/newReservationData";
import { SECTION_CLASS } from "../reservationFormStyles";

const NO_GUIDES = 0;

interface ReservationFormGuidesProps {
  guides: Guide[];
  isBusy: boolean;
  onToggleGuide: (workerId: string) => void;
  selectedGuideIds: string[];
}

/**
 * US-RES-012: no maximum of guides on a tour — a big group (eight
 * cuadraciclos) can take two. Only workers marked `guia`, external or on
 * staff, ever reach this list (`fetchGuides`).
 */
const ReservationFormGuides = ({
  guides,
  isBusy,
  onToggleGuide,
  selectedGuideIds,
}: ReservationFormGuidesProps): JSX.Element => (
  <section className={SECTION_CLASS}>
    <h2 className="font-title-md text-title-md text-on-surface">
      {NEW_RESERVATION_SCREEN.GUIDES.TITLE}
    </h2>

    {guides.length === NO_GUIDES ? (
      <p className="font-label-mono text-label-mono text-on-surface-variant">
        {NEW_RESERVATION_SCREEN.GUIDES.EMPTY}
      </p>
    ) : (
      <div className="flex flex-wrap gap-xs">
        {guides.map((guide) => {
          const isSelected = selectedGuideIds.includes(
            guide.workerId
          );
          return (
            <button
              key={guide.workerId}
              type="button"
              disabled={isBusy}
              onClick={() => onToggleGuide(guide.workerId)}
              className={`flex items-center gap-2 rounded-full border px-sm py-1 font-label-mono text-label-mono transition-colors disabled:opacity-50 ${
                isSelected
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-white/10 text-on-surface-variant hover:border-primary/40"
              }`}
            >
              {guide.fullName}
              {guide.isExternalGuide && (
                <span className="rounded-full border border-white/10 px-1 text-[10px] uppercase opacity-70">
                  {
                    NEW_RESERVATION_SCREEN.GUIDES
                      .EXTERNAL_BADGE
                  }
                </span>
              )}
            </button>
          );
        })}
      </div>
    )}
  </section>
);

export default ReservationFormGuides;
