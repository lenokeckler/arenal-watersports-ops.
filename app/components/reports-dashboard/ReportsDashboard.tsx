import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  REPORTS_SCREEN,
} from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import RevenueSummarySection from "./components/RevenueSummarySection";
import ReservationsTrendSection from "./components/ReservationsTrendSection";
import UsageReportSection from "./components/UsageReportSection";
import WorkerReservationsSection from "./components/WorkerReservationsSection";
import MaintenanceCostSection from "./components/MaintenanceCostSection";
import DepositsSection from "./components/DepositsSection";
import type { ReportsDashboardProps } from "./models/ReportsDashboardProps.interface";

/**
 * `/administracion/reportes` (EP-ADM-06, US-ADM-026 through US-ADM-031).
 * Server Component end to end: every number already arrives computed by a
 * database view or a stored column (see `app/utils/administracion/reports.ts`
 * and `supabase/migrations/20260828001500_reports.sql`) — this only
 * composes the sections, it never sums a page of rows itself.
 */
const ReportsDashboard = ({
  dailyReservationCounts,
  dailyRevenue,
  dailyRevenueRange,
  maintenanceCosts,
  monthlyReservationCounts,
  pendingDeposits,
  reservationsByWorker,
  retainedDeposits,
  selectedDay,
  unitUsage,
}: ReportsDashboardProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <header className="mx-auto mb-lg flex max-w-4xl items-center gap-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.DASHBOARD}
          className="!text-[24px] text-primary"
        />
      </div>
      <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
        {REPORTS_SCREEN.TITLE}
      </h1>
    </header>

    <main className="mx-auto flex max-w-4xl flex-col gap-md">
      <RevenueSummarySection
        rows={dailyRevenue}
        selectedDay={selectedDay}
      />
      <ReservationsTrendSection
        dailyReservationCounts={dailyReservationCounts}
        dailyRevenueRange={dailyRevenueRange}
        monthlyReservationCounts={monthlyReservationCounts}
      />
      <UsageReportSection rows={unitUsage} />
      <WorkerReservationsSection
        rows={reservationsByWorker}
      />
      <MaintenanceCostSection rows={maintenanceCosts} />
      <DepositsSection
        pendingDeposits={pendingDeposits}
        retainedDeposits={retainedDeposits}
      />
    </main>
  </div>
);

export default ReportsDashboard;
