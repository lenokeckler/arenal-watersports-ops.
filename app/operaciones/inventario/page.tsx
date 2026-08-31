import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchInventorySummary } from "@/app/utils/operaciones/inventorySummary";
import { fetchInventoryAlerts } from "@/app/utils/operaciones/inventoryAlerts";
import OperationsInventory from "@/app/components/operations-inventory/OperationsInventory";

export const metadata: Metadata = {
  title: "Inventario — Arenal Water Sports",
};

/**
 * `/operaciones/inventario` (US-OPE-021). The alerts are only counted here
 * — the list itself lives in `/operaciones/avisos` (US-OPE-026,
 * US-OPE-027) — so the entry screen says whether anything needs attention
 * without turning into a second alerts screen.
 */
const OperationsInventoryPage =
  async (): Promise<JSX.Element> => {
    const supabase = await createServerSupabaseClient();
    await requireOperationsWorker(supabase);

    const [categories, alerts] = await Promise.all([
      fetchInventorySummary(supabase),
      fetchInventoryAlerts(supabase),
    ]);

    return (
      <OperationsInventory
        alertsCount={
          alerts.quantity.length + alerts.expiry.length
        }
        categories={categories}
      />
    );
  };

export default OperationsInventoryPage;
