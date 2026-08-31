import type {
  DailyRevenuePoint,
  DailyRevenueRow,
} from "@/app/utils/administracion/reports";

export interface ReservationsRevenueProps {
  revenueRange: DailyRevenuePoint[];
  rows: DailyRevenueRow[];
  selectedDay: string;
}
