import type { Metadata } from "next";
import type { JSX } from "react";
import { redirect } from "next/navigation";
import { PATHS } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { fetchPriceList } from "@/app/utils/tablero/priceList";
import PriceList from "@/app/components/price-list/PriceList";

export const metadata: Metadata = {
  title: "Precios — Arenal Water Sports",
};

/**
 * `/precios` (US-TAB-010): a read-only catalog view for operations.
 * `fetchPriceList` only ever reads `tariffs`, `extras` and `combos` — the
 * policies already deny operations `reservation_charges`, `refunds` and
 * `deposits`, this screen simply never asks for them.
 */
const PriceListPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  const priceList = await fetchPriceList(supabase);

  return <PriceList priceList={priceList} />;
};

export default PriceListPage;
