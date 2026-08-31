import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchInventoryAlerts } from "@/app/utils/operaciones/inventoryAlerts";
import InventoryAlerts from "@/app/components/inventory-alerts/InventoryAlerts";

export const metadata: Metadata = {
  title: "Avisos del inventario — Arenal Water Sports",
};

/**
 * `/operaciones/avisos` (US-OPE-026, US-OPE-027).
 */
const InventoryAlertsPage =
  async (): Promise<JSX.Element> => {
    const supabase = await createServerSupabaseClient();
    await requireOperationsWorker(supabase);

    const alerts = await fetchInventoryAlerts(supabase);

    return <InventoryAlerts alerts={alerts} />;
  };

export default InventoryAlertsPage;
