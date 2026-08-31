import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchMachineDetail } from "@/app/utils/operaciones/machines";
import MachineCorrection from "@/app/components/machine-correction/MachineCorrection";

export const metadata: Metadata = {
  title: "Corregir datos — Arenal Water Sports",
};

interface MachineCorrectionPageParams {
  params: Promise<{ unitId: string }>;
}

/**
 * `/operaciones/maquinas/[unitId]/correccion` (US-OPE-020).
 */
const MachineCorrectionPage = async ({
  params,
}: MachineCorrectionPageParams): Promise<JSX.Element> => {
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

  return (
    <MachineCorrection
      machine={machine}
      workerId={workerId}
    />
  );
};

export default MachineCorrectionPage;
