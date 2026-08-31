"use client";

import type { JSX } from "react";
import {
  MACHINE_DETAIL_SCREEN,
  MAINTENANCE_RECORD_SCREEN,
  PATHS,
} from "@/app/constants";
import OperationsScreenShell from "@/app/components/operations-screen-shell/OperationsScreenShell";
import MaintenanceHistory from "./components/MaintenanceHistory";
import MaintenanceRecordForm from "./components/MaintenanceRecordForm";
import { useMachineMaintenanceViewModel } from "./hooks/useMachineMaintenanceViewModel";
import type { MachineMaintenanceProps } from "./models/MachineMaintenanceProps.interface";

/**
 * `/operaciones/maquinas/[unitId]/mantenimiento` (US-OPE-018,
 * US-OPE-019): registering a job and reading everything already done to
 * this machine.
 */
const MachineMaintenance = (
  props: MachineMaintenanceProps
): JSX.Element => {
  const viewModel = useMachineMaintenanceViewModel(props);

  return (
    <OperationsScreenShell
      backHref={PATHS.OPERATIONS.MACHINE_DETAIL(
        props.unitId
      )}
      backLabel={MACHINE_DETAIL_SCREEN.BACK}
      title={`${MAINTENANCE_RECORD_SCREEN.TITLE} · ${props.unitCode}`}
    >
      <MaintenanceRecordForm
        {...viewModel}
        hasMotor={props.hasMotor}
      />
      <MaintenanceHistory records={props.records} />
    </OperationsScreenShell>
  );
};

export default MachineMaintenance;
