"use client";

import { useState } from "react";
import type { DamageCause } from "@/app/constants";
import {
  buildReservationCloseRows,
  type ReservationCloseEquipmentRow,
} from "@/app/utils/operaciones/reservationCloseRows";
import type { ReservationCloseEquipmentItem } from "@/app/utils/operaciones/reservationCloseData";

export interface ReservationCloseRowsViewModel {
  handleDamageCauseChange: (
    itemId: string,
    value: DamageCause
  ) => void;
  handleDamageDescriptionChange: (
    itemId: string,
    value: string
  ) => void;
  handleDamageImpactChange: (
    itemId: string,
    value: string
  ) => void;
  handleFuelChange: (itemId: string, value: string) => void;
  handleToggleDamage: (itemId: string) => void;
  handleUsageChange: (
    itemId: string,
    value: string
  ) => void;
  rows: ReservationCloseEquipmentRow[];
}

const mapRow = (
  rows: ReservationCloseEquipmentRow[],
  itemId: string,
  patch: Partial<ReservationCloseEquipmentRow>
): ReservationCloseEquipmentRow[] =>
  rows.map((row) =>
    row.itemId === itemId ? { ...row, ...patch } : row
  );

/**
 * US-OPE-009: owns the editable state of every returning unit's row — the
 * fuel/hours reading and the per-unit damage-report toggle — separated from
 * `useReservationCloseViewModel`'s validation and submit so neither hook
 * grows past a single reason to change.
 */
export const useReservationCloseRowsViewModel = (
  items: ReservationCloseEquipmentItem[]
): ReservationCloseRowsViewModel => {
  const [rows, setRows] = useState(
    buildReservationCloseRows(items)
  );

  const handleFuelChange = (
    itemId: string,
    value: string
  ): void =>
    setRows((current) =>
      mapRow(current, itemId, { fuelLevel: value })
    );

  const handleUsageChange = (
    itemId: string,
    value: string
  ): void =>
    setRows((current) =>
      mapRow(current, itemId, { usageReading: value })
    );

  const handleToggleDamage = (itemId: string): void =>
    setRows((current) =>
      current.map((row) =>
        row.itemId === itemId
          ? {
              ...row,
              isReportingDamage: !row.isReportingDamage,
            }
          : row
      )
    );

  const handleDamageCauseChange = (
    itemId: string,
    value: DamageCause
  ): void =>
    setRows((current) =>
      mapRow(current, itemId, { damageCause: value })
    );

  const handleDamageDescriptionChange = (
    itemId: string,
    value: string
  ): void =>
    setRows((current) =>
      mapRow(current, itemId, { damageDescription: value })
    );

  const handleDamageImpactChange = (
    itemId: string,
    value: string
  ): void =>
    setRows((current) =>
      mapRow(current, itemId, { damageImpactDelta: value })
    );

  return {
    handleDamageCauseChange,
    handleDamageDescriptionChange,
    handleDamageImpactChange,
    handleFuelChange,
    handleToggleDamage,
    handleUsageChange,
    rows,
  };
};
