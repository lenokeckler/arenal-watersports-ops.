import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import ChargesSection from "./ChargesSection";

interface ExtraTimeSectionProps {
  minutes: number;
}

const NO_MINUTES = 0;

/**
 * US-RES-031: the minutes an outing ran past its hour — whether it went
 * over without warning or operaciones extended it on the spot. Charging
 * them or letting them go as a courtesy is reservas' decision, and
 * "courtesy" is simply not registering a charge: nothing to record, so
 * nothing is written.
 */
const ExtraTimeSection = ({
  minutes,
}: ExtraTimeSectionProps): JSX.Element => (
  <ChargesSection
    icon={MATERIAL_ICON_NAME.SCHEDULE}
    title={RESERVATION_CHARGES_SCREEN.EXTRA_TIME.TITLE}
  >
    <p className="font-body-base text-body-base text-on-surface-variant">
      {minutes > NO_MINUTES
        ? RESERVATION_CHARGES_SCREEN.EXTRA_TIME.DETECTED(
            minutes
          )
        : RESERVATION_CHARGES_SCREEN.EXTRA_TIME.NONE}
    </p>
    {minutes > NO_MINUTES && (
      <p className="font-label-mono text-label-mono text-on-surface-variant">
        {
          RESERVATION_CHARGES_SCREEN.EXTRA_TIME
            .COURTESY_HINT
        }
      </p>
    )}
  </ChargesSection>
);

export default ExtraTimeSection;
