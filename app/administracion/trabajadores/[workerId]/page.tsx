import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchWorkerDetail } from "@/app/utils/administracion/workers";
import WorkerDetail from "@/app/components/worker-detail/WorkerDetail";

export const metadata: Metadata = {
  title: "Trabajador — Arenal Water Sports",
};

interface WorkerDetailPageParams {
  params: Promise<{ workerId: string }>;
}

/**
 * `/administracion/trabajadores/[workerId]` (US-ADM-002 through
 * US-ADM-010).
 */
const WorkerDetailPage = async ({
  params,
}: WorkerDetailPageParams): Promise<JSX.Element> => {
  const { workerId } = await params;
  const supabase = await createServerSupabaseClient();
  await requireAdminWorker(supabase);

  const worker = await fetchWorkerDetail(supabase, workerId);

  if (!worker) {
    notFound();
  }

  return <WorkerDetail worker={worker} />;
};

export default WorkerDetailPage;
