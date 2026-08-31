import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchMachineDetail } from "@/app/utils/operaciones/machines";
import { fetchUnitDamageReports } from "@/app/utils/operaciones/unitDamageReports";
import MachineDamage from "@/app/components/machine-damage/MachineDamage";

export const metadata: Metadata = {
  title: "Daños de la máquina — Arenal Water Sports",
};

interface MachineDamagePageParams {
  params: Promise<{ unitId: string }>;
}

/**
 * `/operaciones/maquinas/[unitId]/danos` (US-OPE-013, US-OPE-014).
 */
const MachineDamagePage = async ({
  params,
}: MachineDamagePageParams): Promise<JSX.Element> => {
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

  const reports = await fetchUnitDamageReports(
    supabase,
    unitId
  );

  return (
    <MachineDamage
      impactCount={machine.impactCount}
      reports={reports}
      unitCode={machine.code}
      unitId={unitId}
      workerId={workerId}
    />
  );
};

export default MachineDamagePage;
