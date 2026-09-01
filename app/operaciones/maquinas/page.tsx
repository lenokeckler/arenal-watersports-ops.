import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchMachineList } from "@/app/utils/operaciones/machineList";
import { groupMachinesByCategory } from "@/app/utils/operaciones/machineListGrouping";
import OperationsMachines from "@/app/components/operations-machines/OperationsMachines";

export const metadata: Metadata = {
  title: "Equipos — Arenal Water Sports",
};

/**
 * `/operaciones/maquinas` (US-OPE-020): the units that get corrected
 * outside a dispatch — gas, hours, kilometers — grouped by category, one
 * tap away from `/operaciones/maquinas/[unitId]/correccion`.
 */
const OperationsMachinesPage =
  async (): Promise<JSX.Element> => {
    const supabase = await createServerSupabaseClient();
    await requireOperationsWorker(supabase);

    const units = await fetchMachineList(supabase);

    return (
      <OperationsMachines
        categories={groupMachinesByCategory(units)}
      />
    );
  };

export default OperationsMachinesPage;
