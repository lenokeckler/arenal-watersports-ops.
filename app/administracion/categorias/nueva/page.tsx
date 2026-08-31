import type { Metadata } from "next";
import type { JSX } from "react";
import { CATEGORY_FORM_SCREEN } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import CategoryForm from "@/app/components/category-form/CategoryForm";
import CategoryFormPageShell from "@/app/components/category-form/CategoryFormPageShell";

export const metadata: Metadata = {
  title: "Nueva categoría — Arenal Water Sports",
};

/**
 * `/administracion/categorias/nueva` (US-ADM-012 through US-ADM-015).
 */
const NewCategoryPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  return (
    <CategoryFormPageShell
      title={CATEGORY_FORM_SCREEN.NEW_TITLE}
    >
      <CategoryForm
        adminWorkerId={adminWorkerId}
        category={null}
        hasRecords={false}
      />
    </CategoryFormPageShell>
  );
};

export default NewCategoryPage;
