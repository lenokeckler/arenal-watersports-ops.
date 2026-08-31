import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { TRACKING_MODE } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchCategoryDetail } from "@/app/utils/administracion/categories";
import { fetchUnitsForCategory } from "@/app/utils/administracion/units";
import {
  fetchStockDetail,
  fetchStockMovements,
} from "@/app/utils/administracion/stock";
import UnitList from "@/app/components/unit-list/UnitList";
import StockForm from "@/app/components/stock-form/StockForm";
import StockFormPageShell from "@/app/components/stock-form/StockFormPageShell";

export const metadata: Metadata = {
  title: "Inventario de la categoría — Arenal Water Sports",
};

interface CategoryInventoryPageParams {
  params: Promise<{ categoryId: string }>;
}

/**
 * `/administracion/unidades/[categoryId]` (EP-ADM-03). Branches on
 * `tracking_mode`, the same hybrid-model decision the database itself
 * enforces (`units_check_category_mode` / `stock_check_category_mode`): a
 * `by_unit` category gets the ficha list (US-ADM-016), a `by_quantity`
 * category gets the single existence row and its movement history
 * (US-ADM-017).
 */
const CategoryInventoryPage = async ({
  params,
}: CategoryInventoryPageParams): Promise<JSX.Element> => {
  const { categoryId } = await params;
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  const category = await fetchCategoryDetail(
    supabase,
    categoryId
  );
  if (!category) {
    notFound();
  }

  if (category.trackingMode === TRACKING_MODE.BY_UNIT) {
    const units = await fetchUnitsForCategory(
      supabase,
      categoryId
    );

    return (
      <UnitList
        categoryId={categoryId}
        categoryName={category.name}
        hasMotor={category.hasMotor}
        rows={units}
        usageMetric={category.usageMetric}
      />
    );
  }

  const [stock, movements] = await Promise.all([
    fetchStockDetail(supabase, categoryId),
    fetchStockMovements(supabase, categoryId),
  ]);

  return (
    <StockFormPageShell title={category.name}>
      <StockForm
        adminWorkerId={adminWorkerId}
        categoryId={categoryId}
        movements={movements}
        stock={stock}
      />
    </StockFormPageShell>
  );
};

export default CategoryInventoryPage;
