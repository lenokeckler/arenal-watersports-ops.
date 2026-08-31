import type {
  DailyReservationPoint,
  DailyRevenuePoint,
  DailyRevenueRow,
  DepositRow,
  MaintenanceCostRow,
  MonthlyReservationPoint,
  UnitUsageRow,
  WorkerReservationsRow,
} from "@/app/utils/administracion/reports";

export interface ReportsDashboardProps {
  dailyReservationCounts: DailyReservationPoint[];
  dailyRevenue: DailyRevenueRow[];
  dailyRevenueRange: DailyRevenuePoint[];
  maintenanceCosts: MaintenanceCostRow[];
  monthlyReservationCounts: MonthlyReservationPoint[];
  pendingDeposits: DepositRow[];
  reservationsByWorker: WorkerReservationsRow[];
  retainedDeposits: DepositRow[];
  selectedDay: string;
  unitUsage: UnitUsageRow[];
}
