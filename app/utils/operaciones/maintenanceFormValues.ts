import type { Nullable } from "@/app/types";
import {
  CURRENCY_CODE,
  MAINTENANCE_RECORD_SCREEN,
  MAINTENANCE_WORK_TYPE,
  STRING,
  type CurrencyCode,
} from "@/app/constants";
import { parseReadingValue } from "@/app/utils/reservas/equipmentReadingFields";
import type { MaintenanceRecordInput } from "./maintenanceRecords";

export interface MaintenanceFormFields {
  costAmount: string;
  costCurrency: CurrencyCode;
  description: string;
  isExternal: boolean;
  nextOilChangeAt: string;
  otherWorkType: string;
  performedAt: string;
  workType: string;
}

/**
 * US-OPE-018: the presets are shortcuts, not a closed list — "y en general
 * todo lo que se le haga al equipo" — so `Otro` hands the field back to
 * whoever is typing.
 */
export const resolveWorkType = (
  values: MaintenanceFormFields
): string =>
  values.workType === MAINTENANCE_WORK_TYPE.OTHER
    ? values.otherWorkType.trim()
    : values.workType;

export const validateMaintenanceForm = (
  values: MaintenanceFormFields
): Nullable<string> => {
  if (!resolveWorkType(values)) {
    return MAINTENANCE_RECORD_SCREEN.ERROR
      .WORK_TYPE_REQUIRED;
  }

  if (!values.performedAt) {
    return MAINTENANCE_RECORD_SCREEN.ERROR.DATE_REQUIRED;
  }

  return null;
};

/**
 * `maintenance_cost_is_complete` requires the amount and the currency to
 * travel together or not at all: an internal job with no cost keeps both
 * null rather than storing a zero that the maintenance-cost report
 * (US-ADM-030) would then have to filter out.
 */
export const buildMaintenanceRecordInput = (
  values: MaintenanceFormFields,
  unitId: string,
  workerId: string
): MaintenanceRecordInput => {
  const costAmount = parseReadingValue(values.costAmount);

  return {
    costAmount,
    costCurrency:
      costAmount === null ? null : values.costCurrency,
    description: values.description.trim() || null,
    isExternal: values.isExternal,
    nextOilChangeAt: parseReadingValue(
      values.nextOilChangeAt
    ),
    performedAt: values.performedAt,
    unitId,
    workType: resolveWorkType(values),
    workerId,
  };
};

export const buildInitialMaintenanceValues = (
  today: string
): MaintenanceFormFields => ({
  costAmount: STRING.Empty,
  costCurrency: CURRENCY_CODE.USD,
  description: STRING.Empty,
  isExternal: false,
  nextOilChangeAt: STRING.Empty,
  otherWorkType: STRING.Empty,
  performedAt: today,
  workType: MAINTENANCE_WORK_TYPE.OIL_CHANGE,
});
