import type { Metadata } from "next";
import type { JSX } from "react";
import { redirect } from "next/navigation";
import { PATHS } from "@/app/constants";
import { createServerSupabaseClient } from "@/app/services";
import { fetchBoardCategories } from "@/app/utils/tablero/board";
import Board from "@/app/components/board/Board";

export const metadata: Metadata = {
  title: "Tablero — Arenal Water Sports",
};

/**
 * `/tablero` (US-TAB-001 through US-TAB-003) — the screen every worker
 * lands on. The initial page is a Server Component on purpose: a cheap
 * first paint matters more here than almost anywhere else (US-TAB-006,
 * the app opens and closes dozens of times a day over a weak connection).
 * `Board` (a Client Component) takes over from this data for the realtime
 * subscription.
 */
const BoardPage = async (): Promise<JSX.Element> => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(PATHS.ACCESS.LOGIN);
  }

  const initialCategories = await fetchBoardCategories(supabase);

  return <Board initialCategories={initialCategories} />;
};

export default BoardPage;
