import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchInventoryCounts } from "@/app/utils/operaciones/inventoryCountHistory";
import InventoryCountHistory from "@/app/components/inventory-count-history/InventoryCountHistory";

export const metadata: Metadata = {
  title: "Historial de conteos — Arenal Water Sports",
};

/**
 * `/operaciones/conteos` (US-OPE-024).
 */
const InventoryCountsPage =
  async (): Promise<JSX.Element> => {
    const supabase = await createServerSupabaseClient();
    await requireOperationsWorker(supabase);

    const counts = await fetchInventoryCounts(supabase);

    return <InventoryCountHistory counts={counts} />;
  };

export default InventoryCountsPage;
