import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { COMBO_FORM_SCREEN } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import {
  comboHasRecords,
  fetchComboCategoryOptions,
  fetchComboDetail,
} from "@/app/utils/administracion/combos";
import ComboForm from "@/app/components/combo-form/ComboForm";
import ComboFormPageShell from "@/app/components/combo-form/ComboFormPageShell";

export const metadata: Metadata = {
  title: "Editar combo — Arenal Water Sports",
};

interface ComboDetailPageParams {
  params: Promise<{ comboId: string }>;
}

/** `/administracion/combos/[comboId]` (US-ADM-022, US-ADM-023). */
const ComboDetailPage = async ({
  params,
}: ComboDetailPageParams): Promise<JSX.Element> => {
  const { comboId } = await params;
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  const combo = await fetchComboDetail(supabase, comboId);

  if (!combo) {
    notFound();
  }

  const [hasRecords, categoryOptions] = await Promise.all([
    comboHasRecords(supabase, comboId),
    fetchComboCategoryOptions(supabase),
  ]);

  return (
    <ComboFormPageShell
      title={COMBO_FORM_SCREEN.EDIT_TITLE}
    >
      <ComboForm
        adminWorkerId={adminWorkerId}
        categoryOptions={categoryOptions}
        combo={combo}
        hasRecords={hasRecords}
      />
    </ComboFormPageShell>
  );
};

export default ComboDetailPage;
