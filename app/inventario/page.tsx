import type { Metadata } from "next";
import type { JSX } from "react";
import { redirect } from "next/navigation";
import { PAGINATION, PATHS, TRACKING_MODE, type TrackingMode } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { fetchInventoryPage } from "@/app/utils/tablero/inventory";
import Inventory from "@/app/components/inventory/Inventory";

export const metadata: Metadata = {
  title: "Inventario — Arenal Water Sports",
};

interface InventoryPageParams {
  searchParams: Promise<{
    page?: string;
    search?: string;
    trackingMode?: string;
  }>;
}

const FIRST_PAGE = 1;

/**
 * `/inventario` — referenced by US-TAB-001 as the screen life vests,
 * paddles and extinguishers live in, for counting rather than booking.
 * Same server-resolved pagination pattern as `/historial` (US-TAB-008).
 */
const InventoryPage = async ({
  searchParams,
}: InventoryPageParams): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  const resolvedParams = await searchParams;
  const page = Math.max(Number(resolvedParams.page) || FIRST_PAGE, FIRST_PAGE);
  const validModes = Object.values(TRACKING_MODE) as string[];
  const requestedMode = resolvedParams.trackingMode;
  const filters = {
    search: resolvedParams.search ?? null,
    trackingMode:
      requestedMode && validModes.includes(requestedMode)
        ? (requestedMode as TrackingMode)
        : null,
  };

  const { rows, totalCount } = await fetchInventoryPage(
    supabase,
    filters,
    page,
    PAGINATION.DEFAULT_PAGE_SIZE
  );

  const totalPages = Math.max(
    Math.ceil(totalCount / PAGINATION.DEFAULT_PAGE_SIZE),
    FIRST_PAGE
  );

  return (
    <Inventory filters={filters} page={page} rows={rows} totalPages={totalPages} />
  );
};

export default InventoryPage;
