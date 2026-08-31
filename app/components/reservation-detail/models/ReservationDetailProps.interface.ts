import type { ReservationDetail } from "@/app/utils/reservas/reservationDetail";

export interface ReservationDetailProps {
  /**
   * US-RES-032: operaciones never sees money. The charge section is the
   * only part of this screen that shows any, so it is the only part this
   * flag gates.
   */
  canSeeMoney: boolean;
  reservation: ReservationDetail;
  workerId: string;
}
