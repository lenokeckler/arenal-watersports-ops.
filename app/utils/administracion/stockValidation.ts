import type { Nullable } from "@/app/types";
import { STOCK_FORM_SCREEN } from "@/app/constants";

export interface StockFormValues {
  expiryDate: string;
  quantityAvailable: string;
  quantityDamaged: string;
  quantityInRepair: string;
  reason: string;
}

export interface StockFormErrors {
  reason?: string;
}

export interface StockQuantities {
  quantityAvailable: number;
  quantityDamaged: number;
  quantityInRepair: number;
}

const DEFAULT_QUANTITY = 0;

export const parseQuantities = (
  values: StockFormValues
): StockQuantities => ({
  quantityAvailable:
    Number(values.quantityAvailable) || DEFAULT_QUANTITY,
  quantityDamaged:
    Number(values.quantityDamaged) || DEFAULT_QUANTITY,
  quantityInRepair:
    Number(values.quantityInRepair) || DEFAULT_QUANTITY,
});

export const haveQuantitiesChanged = (
  previous: StockQuantities,
  next: StockQuantities
): boolean =>
  previous.quantityAvailable !== next.quantityAvailable ||
  previous.quantityDamaged !== next.quantityDamaged ||
  previous.quantityInRepair !== next.quantityInRepair;

/**
 * US-ADM-017: a reason is only required when a count actually moves —
 * touching just the expiry date has nothing to log.
 */
export const validateStockForm = (
  values: StockFormValues,
  hasQuantityChange: boolean
): StockFormErrors => {
  const errors: StockFormErrors = {};

  if (hasQuantityChange && !values.reason.trim()) {
    errors.reason = STOCK_FORM_SCREEN.ERROR.REASON_REQUIRED;
  }

  return errors;
};

export interface StockWritePayload {
  expiry_date: Nullable<string>;
  quantity_available: number;
  quantity_damaged: number;
  quantity_in_repair: number;
}

export const buildStockPayload = (
  values: StockFormValues
): StockWritePayload => {
  const quantities = parseQuantities(values);

  return {
    expiry_date: values.expiryDate.trim() || null,
    quantity_available: quantities.quantityAvailable,
    quantity_damaged: quantities.quantityDamaged,
    quantity_in_repair: quantities.quantityInRepair,
  };
};
