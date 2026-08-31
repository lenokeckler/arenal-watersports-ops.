import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchMachineDetail } from "@/app/utils/operaciones/machines";
import { fetchMaintenanceRecords } from "@/app/utils/operaciones/maintenanceRecords";
import MachineMaintenance from "@/app/components/machine-maintenance/MachineMaintenance";

export const metadata: Metadata = {
  title:
    "Mantenimiento de la máquina — Arenal Water Sports",
};

interface MachineMaintenancePageParams {
  params: Promise<{ unitId: string }>;
}

/**
 * `/operaciones/maquinas/[unitId]/mantenimiento` (US-OPE-018, US-OPE-019).
 */
const MachineMaintenancePage = async ({
  params,
}: MachineMaintenancePageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const { workerId } =
    await requireOperationsWorker(supabase);

  const { unitId } = await params;
  const machine = await fetchMachineDetail(
    supabase,
    unitId
  );

  if (!machine) {
    notFound();
  }

  const records = await fetchMaintenanceRecords(
    supabase,
    unitId
  );

  return (
    <MachineMaintenance
      hasMotor={machine.hasMotor}
      records={records}
      unitCode={machine.code}
      unitId={unitId}
      usageMetric={machine.usageMetric}
      workerId={workerId}
    />
  );
};

export default MachineMaintenancePage;
