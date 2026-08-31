/**
 * US-RES-027: the payment method is free text in the database
 * (`reservation_charges.payment_method`) because the system never
 * processes a payment nor validates a card — it keeps the record, not the
 * money. These are the shortcuts the office actually uses; `OTHER` opens
 * the free-text field for anything else.
 */
export const PAYMENT_METHOD = {
  CARD: "Tarjeta",
  CASH: "Efectivo",
  OTHER: "Otro",
  PAYPAL: "PayPal",
  SINPE: "SINPE",
  TRANSFER: "Transferencia",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_METHOD_PRESETS = [
  PAYMENT_METHOD.CASH,
  PAYMENT_METHOD.CARD,
  PAYMENT_METHOD.SINPE,
  PAYMENT_METHOD.PAYPAL,
  PAYMENT_METHOD.TRANSFER,
  PAYMENT_METHOD.OTHER,
] as const satisfies readonly PaymentMethod[];
