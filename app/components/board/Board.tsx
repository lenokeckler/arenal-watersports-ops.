"use client";

import type { JSX } from "react";
import { BOARD_SCREEN } from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import BoardCard from "./components/BoardCard";
import { useBoardViewModel } from "./hooks/useBoardViewModel";
import type { BoardProps } from "./models/BoardProps.interface";

/**
 * `/tablero` (US-TAB-001, US-TAB-002, US-TAB-003) — every worker's entry
 * screen. Presentation only; `useBoardViewModel` owns the realtime
 * subscription (`component-architecture`).
 */
const Board = ({ initialCategories }: BoardProps): JSX.Element => {
  const { categories, isEmpty } = useBoardViewModel({ initialCategories });

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <header className="mx-auto mb-lg flex max-w-6xl items-center gap-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high">
          <MaterialIcon
            name={BOARD_SCREEN.ICON}
            className="!text-[24px] text-primary"
          />
        </div>
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
            {BOARD_SCREEN.TITLE}
          </h1>
          <p className="font-body-base text-body-base text-on-surface-variant">
            {BOARD_SCREEN.SUBTITLE}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl">
        {isEmpty ? (
          <p className="font-body-base text-body-base text-on-surface-variant">
            {BOARD_SCREEN.EMPTY_STATE}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <BoardCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Board;
