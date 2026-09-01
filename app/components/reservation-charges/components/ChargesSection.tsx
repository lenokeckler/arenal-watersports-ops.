import type { JSX, ReactNode } from "react";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { MaterialIconName } from "@/app/components/icons/material-icon/constants";

interface ChargesSectionProps {
  children: ReactNode;
  icon: MaterialIconName;
  title: string;
}

/** The card every block of `/reservas/cobros/[reservationId]` sits in. */
const ChargesSection = ({
  children,
  icon,
  title,
}: ChargesSectionProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="flex items-center gap-2 font-title-md text-title-md text-on-surface">
      <MaterialIcon
        name={icon}
        className="text-primary"
      />
      {title}
    </h2>
    {children}
  </section>
);

export default ChargesSection;
