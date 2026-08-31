import type { Nullable } from "@/app/types";
import type {
  ChargeKind,
  CurrencyCode,
  DepositStatus,
} from "@/app/constants";

interface AuthorEmbed {
  full_name: string;
}

export interface ChargeRecord {
  amount: number;
  createdAt: string;
  createdByName: string;
  currency: CurrencyCode;
  id: string;
  kind: ChargeKind;
  paymentMethod: string;
}

export interface RefundRecord {
  amount: number;
  createdAt: string;
  createdByName: string;
  currency: CurrencyCode;
  id: string;
  percentage: number;
  reason: string;
}

export interface DepositRecord {
  amount: number;
  createdAt: string;
  createdByName: string;
  currency: CurrencyCode;
  id: string;
  resolvedByName: Nullable<string>;
  retainedAmount: Nullable<number>;
  retentionReason: Nullable<string>;
  status: DepositStatus;
}

const authorName = (author: unknown): string =>
  (author as AuthorEmbed | null)?.full_name ?? "";

export interface ChargeQueryRow {
  amount: number;
  author: unknown;
  created_at: string;
  currency: CurrencyCode;
  id: string;
  kind: ChargeKind;
  payment_method: string;
}

/** US-RES-023: a charge always carries the name of whoever made it. */
export const toChargeRecord = (
  row: ChargeQueryRow
): ChargeRecord => ({
  amount: row.amount,
  createdAt: row.created_at,
  createdByName: authorName(row.author),
  currency: row.currency,
  id: row.id,
  kind: row.kind,
  paymentMethod: row.payment_method,
});

export interface RefundQueryRow {
  amount: number;
  author: unknown;
  created_at: string;
  currency: CurrencyCode;
  id: string;
  percentage: number;
  reason: string;
}

/** US-RES-028: the percentage returned and the amount it came to. */
export const toRefundRecord = (
  row: RefundQueryRow
): RefundRecord => ({
  amount: row.amount,
  createdAt: row.created_at,
  createdByName: authorName(row.author),
  currency: row.currency,
  id: row.id,
  percentage: row.percentage,
  reason: row.reason,
});

export interface DepositQueryRow {
  amount: number;
  author: unknown;
  created_at: string;
  currency: CurrencyCode;
  id: string;
  resolver: unknown;
  retained_amount: Nullable<number>;
  retention_reason: Nullable<string>;
  status: DepositStatus;
}

/** US-RES-029/US-RES-030: who received the deposit and who resolved it. */
export const toDepositRecord = (
  row: DepositQueryRow
): DepositRecord => ({
  amount: row.amount,
  createdAt: row.created_at,
  createdByName: authorName(row.author),
  currency: row.currency,
  id: row.id,
  resolvedByName:
    (row.resolver as AuthorEmbed | null)?.full_name ?? null,
  retainedAmount: row.retained_amount,
  retentionReason: row.retention_reason,
  status: row.status,
});
