import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import {
  TRACKING_MODE,
  UNIT_FORM_SCREEN,
} from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchCategoryDetail } from "@/app/utils/administracion/categories";
import UnitForm from "@/app/components/unit-form/UnitForm";
import UnitFormPageShell from "@/app/components/unit-form/UnitFormPageShell";

export const metadata: Metadata = {
  title: "Nueva unidad — Arenal Water Sports",
};

interface NewUnitPageParams {
  params: Promise<{ categoryId: string }>;
}

/**
 * `/administracion/unidades/[categoryId]/nueva` (US-ADM-016). Only reachable
 * for a `by_unit` category — `units_check_category_mode` would reject the
 * insert anyway, this just avoids offering the screen at all.
 */
const NewUnitPage = async ({
  params,
}: NewUnitPageParams): Promise<JSX.Element> => {
  const { categoryId } = await params;
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  const category = await fetchCategoryDetail(
    supabase,
    categoryId
  );
  if (
    !category ||
    category.trackingMode !== TRACKING_MODE.BY_UNIT
  ) {
    notFound();
  }

  return (
    <UnitFormPageShell
      categoryId={categoryId}
      title={UNIT_FORM_SCREEN.NEW_TITLE}
    >
      <UnitForm
        adminWorkerId={adminWorkerId}
        categoryId={categoryId}
        consumesFuel={category.consumesFuel}
        hasMotor={category.hasMotor}
        unit={null}
        usageMetric={category.usageMetric}
      />
    </UnitFormPageShell>
  );
};

export default NewUnitPage;
