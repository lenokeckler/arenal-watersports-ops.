import type { Metadata } from "next";
import type { JSX } from "react";
import { COMBO_FORM_SCREEN } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import { fetchComboCategoryOptions } from "@/app/utils/administracion/combos";
import ComboForm from "@/app/components/combo-form/ComboForm";
import ComboFormPageShell from "@/app/components/combo-form/ComboFormPageShell";

export const metadata: Metadata = {
  title: "Nuevo combo — Arenal Water Sports",
};

/** `/administracion/combos/nueva` (US-ADM-022, US-ADM-023). */
const NewComboPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  const categoryOptions =
    await fetchComboCategoryOptions(supabase);

  return (
    <ComboFormPageShell title={COMBO_FORM_SCREEN.NEW_TITLE}>
      <ComboForm
        adminWorkerId={adminWorkerId}
        categoryOptions={categoryOptions}
        combo={null}
        hasRecords={false}
      />
    </ComboFormPageShell>
  );
};

export default NewComboPage;
