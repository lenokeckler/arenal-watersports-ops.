"use client";

import type { JSX } from "react";
import {
  DAMAGE_REPORTS_SCREEN,
  MACHINE_DETAIL_SCREEN,
  PATHS,
} from "@/app/constants";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";
import MachineDamageForm from "./components/MachineDamageForm";
import MachineDamageHistory from "./components/MachineDamageHistory";
import { useMachineDamageViewModel } from "./hooks/useMachineDamageViewModel";
import type { MachineDamageProps } from "./models/MachineDamageProps.interface";

/**
 * `/operaciones/maquinas/[unitId]/danos` (US-OPE-013, US-OPE-014):
 * raising a report and reading the ones already filed, on the same screen
 * because that is the order the decision happens in — you look at the
 * history before deciding what this new hit means.
 */
const MachineDamage = (
  props: MachineDamageProps
): JSX.Element => {
  const viewModel = useMachineDamageViewModel(props);

  return (
    <OperationsScreenShell
      backHref={PATHS.OPERATIONS.MACHINE_DETAIL(
        props.unitId
      )}
      backLabel={MACHINE_DETAIL_SCREEN.BACK}
      subtitle={DAMAGE_REPORTS_SCREEN.IMPACT_SUMMARY(
        props.impactCount
      )}
      title={`${DAMAGE_REPORTS_SCREEN.TITLE} · ${props.unitCode}`}
    >
      <MachineDamageForm
        {...viewModel}
        onCauseChange={viewModel.handleCauseChange}
      />
      <MachineDamageHistory reports={props.reports} />
    </OperationsScreenShell>
  );
};

export default MachineDamage;
