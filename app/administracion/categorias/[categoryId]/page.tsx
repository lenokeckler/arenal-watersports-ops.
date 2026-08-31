import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { CATEGORY_FORM_SCREEN } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireAdminWorker } from "@/app/utils/administracion/requireAdminWorker";
import {
  categoryHasRecords,
  fetchCategoryDetail,
} from "@/app/utils/administracion/categories";
import CategoryForm from "@/app/components/category-form/CategoryForm";
import CategoryFormPageShell from "@/app/components/category-form/CategoryFormPageShell";

export const metadata: Metadata = {
  title: "Editar categoría — Arenal Water Sports",
};

interface CategoryDetailPageParams {
  params: Promise<{ categoryId: string }>;
}

/**
 * `/administracion/categorias/[categoryId]` (US-ADM-012 through
 * US-ADM-015). `tracking_mode` renders locked once the category already has
 * units or stock — `categories_freeze_tracking_mode` is what actually
 * blocks the change, this only avoids offering a control the database
 * would reject.
 */
const CategoryDetailPage = async ({
  params,
}: CategoryDetailPageParams): Promise<JSX.Element> => {
  const { categoryId } = await params;
  const supabase = await createServerSupabaseClient();
  const adminWorkerId = await requireAdminWorker(supabase);

  const category = await fetchCategoryDetail(
    supabase,
    categoryId
  );

  if (!category) {
    notFound();
  }

  const hasRecords = await categoryHasRecords(
    supabase,
    categoryId
  );

  return (
    <CategoryFormPageShell
      title={CATEGORY_FORM_SCREEN.EDIT_TITLE}
    >
      <CategoryForm
        adminWorkerId={adminWorkerId}
        category={category}
        hasRecords={hasRecords}
      />
    </CategoryFormPageShell>
  );
};

export default CategoryDetailPage;
