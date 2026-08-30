import type { BoardCategory } from "@/app/utils/tablero/board";

export interface BoardViewModel {
  categories: BoardCategory[];
  isEmpty: boolean;
}
