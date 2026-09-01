import type { Metadata } from "next";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import { WORK_AREA } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { requireWorkerWithAreas } from "@/app/utils/reservas/access";
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
 * for realtime updates from there. Every area lands here — reservas reads
 * it to answer a customer, operaciones dispatches from it — so
 * `requireWorkerWithAreas` allows all three; it only exists here for
 * `workerId`, which `CategoryDetail` needs to dispatch (US-OPE-002).
 */
const CategoryPage = async ({
  params,
}: CategoryPageParams): Promise<JSX.Element> => {
  const { categoryId } = await params;
  const supabase = await createServerSupabaseClient();
  const { workerId } = await requireWorkerWithAreas(
    supabase,
    [
      WORK_AREA.ADMINISTRATION,
      WORK_AREA.OPERATIONS,
      WORK_AREA.RESERVATIONS,
    ]
  );

  const initialDetail = await fetchCategoryDetail(
    supabase,
    categoryId
  );

  if (!initialDetail) {
    notFound();
  }

  return (
    <CategoryDetail
      categoryId={categoryId}
      initialDetail={initialDetail}
      workerId={workerId}
    />
  );
};

export default CategoryPage;
