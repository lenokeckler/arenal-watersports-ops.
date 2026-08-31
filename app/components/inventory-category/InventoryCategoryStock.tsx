"use client";

import type { JSX } from "react";
import type { StockDetail } from "@/app/utils/administracion/stock";
import InventoryStockForm from "./components/InventoryStockForm";
import { useStockAdjustmentViewModel } from "./hooks/useStockAdjustmentViewModel";

interface InventoryCategoryStockProps {
  categoryId: string;
  stock: StockDetail;
  workerId: string;
}

/**
 * The `by_quantity` half of `/operaciones/inventario/[categoryId]`
 * (US-OPE-021, US-OPE-022, US-OPE-025): how many there are in each state,
 * changed with a reason that becomes the category's only history.
 */
const InventoryCategoryStock = ({
  categoryId,
  stock,
  workerId,
}: InventoryCategoryStockProps): JSX.Element => {
  const viewModel = useStockAdjustmentViewModel(
    categoryId,
    stock,
    workerId
  );

  return <InventoryStockForm {...viewModel} />;
};

export default InventoryCategoryStock;
