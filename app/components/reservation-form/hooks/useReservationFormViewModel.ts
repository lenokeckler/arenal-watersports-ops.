"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  COMBO_MODE,
  EQUIPMENT_VALIDITY,
  NEW_RESERVATION_SCREEN,
  PATHS,
  RESERVATION_TYPE,
  TRACKING_MODE,
  type EquipmentValidity,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  validateNewReservationForm,
  type NewReservationFormErrors,
} from "@/app/utils/reservas/newReservationValidation";
import {
  createReservation,
  type NewReservationEquipmentItem,
} from "@/app/utils/reservas/createReservation";
import {
  tariffTypeForCategory,
  type CategoryTariff,
  type ReservableComboItem,
} from "@/app/utils/reservas/newReservationData";
import { useReservationDetailsFields } from "./useReservationDetailsFields";
import { useReservationEquipmentSelection } from "./useReservationEquipmentSelection";
import { useReservationAvailability } from "./useReservationAvailability";
import { useReservationComboSelection } from "./useReservationComboSelection";
import { useReservationExtrasSelection } from "./useReservationExtrasSelection";
import { useReservationGuidesSelection } from "./useReservationGuidesSelection";
import type { ReservationFormProps } from "../models/ReservationFormProps.interface";
import type { ReservationFormViewModel } from "../models/ReservationFormViewModel.interface";

const NO_ERRORS = 0;
const NO_AMOUNT = 0;

interface AmountPair {
  amountCrc: Nullable<number>;
  amountUsd: Nullable<number>;
}

const buildFreeFormItems = (
  quantities: Record<string, number>,
  selectedUnitIds: string[]
): NewReservationEquipmentItem[] => [
  ...Object.entries(quantities).map(
    ([categoryId, quantity]) => ({
      categoryId,
      quantity,
      unitId: null,
    })
  ),
  ...selectedUnitIds.map((unitId) => ({
    categoryId: null,
    quantity: null,
    unitId,
  })),
];

const buildComboPredefinedItems = (
  comboItems: ReservableComboItem[],
  comboUnitSelections: Record<string, string[]>
): NewReservationEquipmentItem[] =>
  comboItems.flatMap(
    (item): NewReservationEquipmentItem[] =>
      item.trackingMode === TRACKING_MODE.BY_UNIT
        ? (comboUnitSelections[item.categoryId] ?? []).map(
            (unitId): NewReservationEquipmentItem => ({
              categoryId: null,
              quantity: null,
              unitId,
            })
          )
        : [
            {
              categoryId: item.categoryId,
              quantity: item.quantity,
              unitId: null,
            },
          ]
  );

const buildExtraItems = (
  selectedUnitIds: string[],
  selectedExtraIdsByUnit: Record<string, string[]>,
  extrasByUnit: ReservationFormProps["extrasByUnit"]
): NewReservationEquipmentItem[] =>
  selectedUnitIds.flatMap((unitId) => {
    const selectedExtraIds =
      selectedExtraIdsByUnit[unitId] ?? [];
    const unitExtras = extrasByUnit[unitId] ?? [];
    return selectedExtraIds
      .map((extraId) =>
        unitExtras.find((extra) => extra.id === extraId)
      )
      .filter(
        (extra): extra is (typeof unitExtras)[number] =>
          Boolean(extra)
      )
      .map((extra) => ({
        categoryId: extra.occupiesCategoryId,
        extraId: extra.id,
        quantity: extra.occupiesQuantity,
        unitId: null,
      }));
  });

/**
 * US-RES-010: the suggested price for a combo a la medida — the sum of each
 * picked category's individual tariff, `tour` for a guide-only category
 * (never rented on its own) and `rental` for everything else. A category
 * with no matching tariff simply contributes nothing to the sum.
 */
const computeCustomComboSuggestion = (
  quantities: Record<string, number>,
  selectedUnitIds: string[],
  categories: ReservationFormProps["categories"],
  candidateUnits: ReservationFormProps["candidateUnits"],
  tariffs: CategoryTariff[]
): AmountPair => {
  const categoryIds = new Set<string>([
    ...Object.keys(quantities),
    ...selectedUnitIds
      .map(
        (unitId) =>
          candidateUnits.find((unit) => unit.id === unitId)
            ?.categoryId
      )
      .filter((categoryId): categoryId is string =>
        Boolean(categoryId)
      ),
  ]);

  let totalUsd = NO_AMOUNT;
  let hasUsd = false;
  let totalCrc = NO_AMOUNT;
  let hasCrc = false;

  for (const categoryId of categoryIds) {
    const category = categories.find(
      (candidate) => candidate.id === categoryId
    );
    const tariffType = tariffTypeForCategory(
      category?.guideOnly ?? false
    );
    const tariff = tariffs.find(
      (candidate) =>
        candidate.categoryId === categoryId &&
        candidate.type === tariffType
    );
    if (typeof tariff?.amountUsd === "number") {
      totalUsd += tariff.amountUsd;
      hasUsd = true;
    }
    if (typeof tariff?.amountCrc === "number") {
      totalCrc += tariff.amountCrc;
      hasCrc = true;
    }
  }

  return {
    amountCrc: hasCrc ? totalCrc : null,
    amountUsd: hasUsd ? totalUsd : null,
  };
};

/**
 * US-RES-010: reservas can override the suggested price in a single
 * "monto acordado" field. The override lands on whichever currency the
 * suggestion actually carries as its primary one (USD when present, CRC
 * otherwise); a second currency the same categories happened to also
 * price in keeps its suggested value, since one plain number cannot stand
 * for two currencies at once.
 */
const applyAgreedAmountOverride = (
  suggestion: AmountPair,
  override: Nullable<number>
): AmountPair => {
  const primaryIsUsd = suggestion.amountUsd !== null;
  return {
    amountCrc:
      !primaryIsUsd && suggestion.amountCrc !== null
        ? (override ?? suggestion.amountCrc)
        : suggestion.amountCrc,
    amountUsd: primaryIsUsd
      ? (override ?? suggestion.amountUsd)
      : suggestion.amountUsd,
  };
};

/**
 * The facade behind `ReservationForm` (US-RES-004 through US-RES-012):
 * field state, equipment/combo/extras/guides selection and live
 * availability each own their slice, this only combines them for
 * validation and the create submit.
 */
export const useReservationFormViewModel = ({
  candidateUnits,
  categories,
  combos,
  extrasByUnit,
  guides,
  tariffs,
  workerId,
}: ReservationFormProps): ReservationFormViewModel => {
  const router = useRouter();
  const details = useReservationDetailsFields();
  const selection = useReservationEquipmentSelection();
  const comboSelection =
    useReservationComboSelection(combos);
  const extrasSelection = useReservationExtrasSelection();
  const guidesSelection = useReservationGuidesSelection();

  const isCombo =
    details.values.type === RESERVATION_TYPE.COMBO;
  const isPredefinedCombo =
    isCombo &&
    comboSelection.mode === COMBO_MODE.PREDEFINED;
  const isCustomCombo =
    isCombo && comboSelection.mode === COMBO_MODE.CUSTOM;

  // US-RES-008: renta never takes equipment that only goes out guided;
  // tour and combo both can.
  const excludeGuideOnly =
    details.values.type === RESERVATION_TYPE.RENTAL;
  const visibleCategories = useMemo(
    () =>
      excludeGuideOnly
        ? categories.filter(
            (category) => !category.guideOnly
          )
        : categories,
    [categories, excludeGuideOnly]
  );
  const byQuantityCategories = useMemo(
    () =>
      visibleCategories.filter(
        (category) =>
          category.trackingMode ===
          TRACKING_MODE.BY_QUANTITY
      ),
    [visibleCategories]
  );
  const byUnitCategories = useMemo(
    () =>
      visibleCategories.filter(
        (category) =>
          category.trackingMode === TRACKING_MODE.BY_UNIT
      ),
    [visibleCategories]
  );
  const quantityCategoryIds = useMemo(
    () =>
      byQuantityCategories.map((category) => category.id),
    [byQuantityCategories]
  );
  const candidateUnitsByCategory = useMemo(() => {
    const grouped: Record<string, typeof candidateUnits> =
      {};
    for (const unit of candidateUnits) {
      grouped[unit.categoryId] = [
        ...(grouped[unit.categoryId] ?? []),
        unit,
      ];
    }
    return grouped;
  }, [candidateUnits]);

  const availability = useReservationAvailability(
    details.startsAtIso,
    details.endsAtIso,
    quantityCategoryIds,
    selection.selectedUnitIds
  );

  const selectedUnitIdsForExtras = isPredefinedCombo
    ? Object.values(
        comboSelection.comboUnitSelections
      ).flat()
    : selection.selectedUnitIds;

  const customComboSuggestion = useMemo(
    () =>
      isCustomCombo
        ? computeCustomComboSuggestion(
            selection.quantities,
            selection.selectedUnitIds,
            categories,
            candidateUnits,
            tariffs
          )
        : { amountCrc: null, amountUsd: null },
    [
      candidateUnits,
      categories,
      isCustomCombo,
      selection.quantities,
      selection.selectedUnitIds,
      tariffs,
    ]
  );

  const [agreedAmount, setAgreedAmount] = useState("");
  const [errors, setErrors] =
    useState<NewReservationFormErrors>({});
  const [formError, setFormError] =
    useState<Nullable<string>>(null);
  const [isSaving, setIsSaving] = useState(false);

  const equipmentValidity: EquipmentValidity =
    isPredefinedCombo
      ? !comboSelection.selectedCombo
        ? EQUIPMENT_VALIDITY.COMBO_REQUIRED
        : comboSelection.isPredefinedSelectionComplete
          ? EQUIPMENT_VALIDITY.VALID
          : EQUIPMENT_VALIDITY.COMBO_INCOMPLETE
      : selection.hasAnySelection
        ? EQUIPMENT_VALIDITY.VALID
        : EQUIPMENT_VALIDITY.INVALID;

  const submit = async (): Promise<void> => {
    setIsSaving(true);

    const supabase = createBrowserSupabaseClient();

    const equipmentItems = isPredefinedCombo
      ? buildComboPredefinedItems(
          comboSelection.selectedCombo?.items ?? [],
          comboSelection.comboUnitSelections
        )
      : buildFreeFormItems(
          selection.quantities,
          selection.selectedUnitIds
        );
    const extraItems = buildExtraItems(
      selectedUnitIdsForExtras,
      extrasSelection.selectedExtraIdsByUnit,
      extrasByUnit
    );

    const listAmounts: AmountPair = isPredefinedCombo
      ? {
          amountCrc:
            comboSelection.selectedCombo?.packagePriceCrc ??
            null,
          amountUsd:
            comboSelection.selectedCombo?.packagePriceUsd ??
            null,
        }
      : isCustomCombo
        ? customComboSuggestion
        : { amountCrc: null, amountUsd: null };
    const agreedAmounts: AmountPair = isPredefinedCombo
      ? listAmounts
      : isCustomCombo
        ? applyAgreedAmountOverride(
            customComboSuggestion,
            agreedAmount.trim()
              ? Number(agreedAmount)
              : null
          )
        : { amountCrc: null, amountUsd: null };

    try {
      const reservation = await createReservation(
        supabase,
        {
          agreedAmountCrc: agreedAmounts.amountCrc,
          agreedAmountUsd: agreedAmounts.amountUsd,
          comboId: isPredefinedCombo
            ? (comboSelection.selectedCombo?.id ?? null)
            : null,
          customerName: details.values.customerName.trim(),
          durationMinutes: Number(
            details.values.durationMinutes
          ),
          guideWorkerIds:
            details.values.type === RESERVATION_TYPE.TOUR
              ? guidesSelection.selectedGuideIds
              : [],
          items: [...equipmentItems, ...extraItems],
          listAmountCrc: listAmounts.amountCrc,
          listAmountUsd: listAmounts.amountUsd,
          peopleCount: Number(details.values.peopleCount),
          startsAt: details.startsAtIso,
          type: details.values.type,
        },
        workerId
      );
      router.replace(
        PATHS.RESERVATIONS.DETAIL_BY_ID(reservation.id)
      );
    } catch {
      setIsSaving(false);
      setFormError(NEW_RESERVATION_SCREEN.ERROR.GENERIC);
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateNewReservationForm(
      details.values,
      details.startsAtIso,
      equipmentValidity
    );
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > NO_ERRORS) {
      return;
    }

    void submit();
  };

  return {
    agreedAmount,
    byQuantityCategories,
    byUnitCategories,
    candidateUnitsByCategory,
    categoryAvailability: availability.categoryAvailability,
    comboMode: comboSelection.mode,
    comboUnitSelections: comboSelection.comboUnitSelections,
    combos,
    customComboSuggestedAmountCrc:
      customComboSuggestion.amountCrc,
    customComboSuggestedAmountUsd:
      customComboSuggestion.amountUsd,
    detailsValues: details.values,
    errors,
    extrasByUnit,
    formError,
    guides,
    handleAgreedAmountChange: setAgreedAmount,
    handleComboModeChange: comboSelection.setMode,
    handleCustomerNameChange:
      details.handleCustomerNameChange,
    handleDateChange: details.handleDateChange,
    handleDurationChange: details.handleDurationChange,
    handlePeopleCountChange:
      details.handlePeopleCountChange,
    handleQuantityChange: selection.handleQuantityChange,
    handleSelectCombo: comboSelection.handleSelectCombo,
    handleSubmit,
    handleTimeChange: details.handleTimeChange,
    handleToggleComboUnit:
      comboSelection.handleToggleComboUnit,
    handleToggleExtra: extrasSelection.handleToggleExtra,
    handleToggleGuide: guidesSelection.handleToggleGuide,
    handleToggleUnit: selection.handleToggleUnit,
    handleTypeChange: details.handleTypeChange,
    isBusy: isSaving || availability.isChecking,
    quantities: selection.quantities,
    selectedCombo: comboSelection.selectedCombo,
    selectedExtraIdsByUnit:
      extrasSelection.selectedExtraIdsByUnit,
    selectedGuideIds: guidesSelection.selectedGuideIds,
    selectedUnitIds: selection.selectedUnitIds,
    selectedUnitIdsForExtras,
    unitConflicts: availability.unitConflicts,
  };
};
