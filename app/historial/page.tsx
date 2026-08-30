import type { Metadata } from "next";
import type { JSX } from "react";
import { redirect } from "next/navigation";
import { PAGINATION, PATHS, RESERVATION_TYPE, type ReservationType } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { fetchHistoryPage } from "@/app/utils/tablero/history";
import History from "@/app/components/history/History";

export const metadata: Metadata = {
  title: "Historial — Arenal Water Sports",
};

interface HistoryPageParams {
  searchParams: Promise<{
    categoryId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
    type?: string;
  }>;
}

const FIRST_PAGE = 1;

/**
 * `/historial` (US-TAB-009). Filters and pagination arrive as URL search
 * params from `History`'s native GET form and page links, and are
 * resolved here, on the server, one page at a time (US-TAB-008).
 */
const HistoryPage = async ({
  searchParams,
}: HistoryPageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  const resolvedParams = await searchParams;
  const page = Math.max(Number(resolvedParams.page) || FIRST_PAGE, FIRST_PAGE);
  const validTypes = Object.values(RESERVATION_TYPE) as string[];
  const requestedType = resolvedParams.type;
  const filters = {
    categoryId: resolvedParams.categoryId ?? null,
    dateFrom: resolvedParams.dateFrom ?? null,
    dateTo: resolvedParams.dateTo ?? null,
    type:
      requestedType && validTypes.includes(requestedType)
        ? (requestedType as ReservationType)
        : null,
  };

  const [{ rows, totalCount }, categoriesResult] = await Promise.all([
    fetchHistoryPage(
      supabase,
      filters,
      page,
      PAGINATION.DEFAULT_PAGE_SIZE
    ),
    supabase
      .from("equipment_categories")
      .select("id, name")
      .eq("status", "active")
      .order("name"),
  ]);

  const totalPages = Math.max(
    Math.ceil(totalCount / PAGINATION.DEFAULT_PAGE_SIZE),
    FIRST_PAGE
  );

  return (
    <History
      categoryOptions={categoriesResult.data ?? []}
      filters={filters}
      page={page}
      rows={rows}
      totalPages={totalPages}
    />
  );
};

export default HistoryPage;
