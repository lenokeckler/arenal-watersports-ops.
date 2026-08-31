import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/app/services";
import { requireOperationsWorker } from "@/app/utils/operaciones/operationsAccess";
import { fetchInventoryCategoryDetail } from "@/app/utils/operaciones/inventoryCategory";
import InventoryCategory from "@/app/components/inventory-category/InventoryCategory";

export const metadata: Metadata = {
  title: "Categoría del inventario — Arenal Water Sports",
};

interface InventoryCategoryPageParams {
  params: Promise<{ categoryId: string }>;
}

/**
 * `/operaciones/inventario/[categoryId]` (US-OPE-021, US-OPE-022,
 * US-OPE-025).
 */
const InventoryCategoryPage = async ({
  params,
}: InventoryCategoryPageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const { workerId } =
    await requireOperationsWorker(supabase);

  const { categoryId } = await params;
  const detail = await fetchInventoryCategoryDetail(
    supabase,
    categoryId
  );

  if (!detail) {
    notFound();
  }

  return (
    <InventoryCategory
      detail={detail}
      workerId={workerId}
    />
  );
};

export default InventoryCategoryPage;
