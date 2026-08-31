import type { Metadata } from "next";
import type { JSX } from "react";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchCountSheet } from "@/app/utils/operaciones/inventoryCountSheet";
import InventoryCountForm from "@/app/components/inventory-count-form/InventoryCountForm";

export const metadata: Metadata = {
  title: "Nuevo conteo — Arenal Water Sports",
};

/**
 * `/operaciones/conteos/nuevo` (US-OPE-023).
 */
const NewInventoryCountPage =
  async (): Promise<JSX.Element> => {
    const supabase = await createServerSupabaseClient();
    const { workerId } =
      await requireOperationsWorker(supabase);

    const categories = await fetchCountSheet(supabase);

    return (
      <InventoryCountForm
        categories={categories}
        workerId={workerId}
      />
    );
  };

export default NewInventoryCountPage;
