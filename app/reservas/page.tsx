import { redirect } from "next/navigation";
import { PATHS } from "@/app/constants";

/** `/reservas` has no screen of its own — the calendar is the entry point. */
const ReservationsRootPage = (): never => {
  redirect(PATHS.RESERVATIONS.CALENDAR);
};

export default ReservationsRootPage;
