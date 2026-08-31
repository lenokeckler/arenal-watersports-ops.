import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchConditionPhotos } from "@/app/utils/operaciones/conditionPhotos";
import { fetchMachineDetail } from "@/app/utils/operaciones/machines";
import MachineDetail from "@/app/components/machine-detail/MachineDetail";

export const metadata: Metadata = {
  title: "Máquina — Arenal Water Sports",
};

interface MachinePageParams {
  params: Promise<{ unitId: string }>;
}

/**
 * `/operaciones/maquinas/[unitId]` (US-OPE-010, US-OPE-011, US-OPE-012,
 * US-OPE-015, US-OPE-016, US-OPE-017) — the ficha of one machine and the
 * hub for everything that hangs off it.
 */
const MachinePage = async ({
  params,
}: MachinePageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const { canManageConditionPhotos, workerId } =
    await requireOperationsWorker(supabase);

  const { unitId } = await params;
  const machine = await fetchMachineDetail(
    supabase,
    unitId
  );

  if (!machine) {
    notFound();
  }

  const photos = machine.hasConditionPhotos
    ? await fetchConditionPhotos(supabase, unitId)
    : [];

  return (
    <MachineDetail
      canUploadPhotos={canManageConditionPhotos}
      machine={machine}
      photos={photos}
      workerId={workerId}
    />
  );
};

export default MachinePage;
