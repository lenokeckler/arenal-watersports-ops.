import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchInventoryCountDetail } from "@/app/utils/operaciones/inventoryCountDetail";
import InventoryCountDetail from "@/app/components/inventory-count-detail/InventoryCountDetail";

export const metadata: Metadata = {
  title: "Conteo — Arenal Water Sports",
};

interface InventoryCountPageParams {
  params: Promise<{ countId: string }>;
}

/**
 * `/operaciones/conteos/[countId]` (US-OPE-024).
 */
const InventoryCountPage = async ({
  params,
}: InventoryCountPageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  await requireOperationsWorker(supabase);

  const { countId } = await params;
  const count = await fetchInventoryCountDetail(
    supabase,
    countId
  );

  if (!count) {
    notFound();
  }

  return <InventoryCountDetail count={count} />;
};

export default InventoryCountPage;
