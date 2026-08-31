import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound, redirect } from "next/navigation";
import { PATHS } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { fetchCategoryDetail } from "@/app/utils/tablero/categoryDetail";
import CategoryDetail from "@/app/components/category-detail/CategoryDetail";

export const metadata: Metadata = {
  title: "Categoría — Arenal Water Sports",
};

interface CategoryPageParams {
  params: Promise<{ categoryId: string }>;
}

/**
 * `/tablero/categoria/[categoryId]` (US-TAB-002). Same split as `/tablero`:
 * the server fetches the first render, the client component subscribes
 * for realtime updates from there.
 */
const CategoryPage = async ({
  params,
}: CategoryPageParams): Promise<JSX.Element> => {
  const { categoryId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  const initialDetail = await fetchCategoryDetail(supabase, categoryId);

  if (!initialDetail) {
    notFound();
  }

  return (
    <CategoryDetail categoryId={categoryId} initialDetail={initialDetail} />
  );
};

export default CategoryPage;
