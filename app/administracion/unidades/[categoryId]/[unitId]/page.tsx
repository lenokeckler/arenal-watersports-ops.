import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { UNIT_FORM_SCREEN } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchCategoryDetail } from "@/app/utils/administracion/categories";
import { fetchUnitDetail } from "@/app/utils/administracion/units";
import UnitForm from "@/app/components/unit-form/UnitForm";
import UnitFormPageShell from "@/app/components/unit-form/UnitFormPageShell";

export const metadata: Metadata = {
  title: "Editar unidad — Arenal Water Sports",
};

interface UnitDetailPageParams {
  params: Promise<{ categoryId: string; unitId: string }>;
}

/**
 * `/administracion/unidades/[categoryId]/[unitId]` (US-ADM-016,
 * US-ADM-018).
 */
const UnitDetailPage = async ({
  params,
}: UnitDetailPageParams): Promise<JSX.Element> => {
  const { categoryId, unitId } = await params;
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  const [category, unit] = await Promise.all([
    fetchCategoryDetail(supabase, categoryId),
    fetchUnitDetail(supabase, unitId),
  ]);

  if (
    !category ||
    !unit ||
    unit.categoryId !== categoryId
  ) {
    notFound();
  }

  return (
    <UnitFormPageShell
      categoryId={categoryId}
      title={UNIT_FORM_SCREEN.EDIT_TITLE}
    >
      <UnitForm
        adminWorkerId={adminWorkerId}
        categoryId={categoryId}
        consumesFuel={category.consumesFuel}
        hasMotor={category.hasMotor}
        unit={unit}
        usageMetric={category.usageMetric}
      />
    </UnitFormPageShell>
  );
};

export default UnitDetailPage;
