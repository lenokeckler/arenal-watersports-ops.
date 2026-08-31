import type { ReservationDetailModal } from "@/app/constants";

export interface ReservationDetailViewModel {
  activeModal: ReservationDetailModal;
  canCancel: boolean;
  canEdit: boolean;
  canPostpone: boolean;
  canSplit: boolean;
  handleActionComplete: () => void;
  handleCloseModal: () => void;
  handleOpenCancel: () => void;
  handleOpenEdit: () => void;
  handleOpenPostpone: () => void;
  handleOpenSplit: () => void;
}
