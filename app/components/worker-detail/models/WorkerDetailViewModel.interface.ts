import type { Nullable } from "@/app/types";
import type {
  WorkArea,
  WorkerMark,
  WorkerStatus,
} from "@/app/constants";
import type { WorkerDetail } from "@/app/utils/administracion/workers";

export interface WorkerDetailViewModel {
  actionError: Nullable<string>;
  availableAreas: WorkArea[];
  expiresAtDraft: string;
  handleAddArea: (area: WorkArea) => void;
  handleBlock: () => void;
  handleCancelDelete: () => void;
  handleConfirmDelete: () => void;
  handleExtendExpiry: () => void;
  handleExpiresAtDraftChange: (value: string) => void;
  handleReactivate: () => void;
  handleRemoveArea: (area: WorkArea) => void;
  handleRehire: () => void;
  handleRequestDelete: () => void;
  handleResetPassword: () => void;
  handleToggleMark: (
    mark: WorkerMark,
    isGranted: boolean
  ) => void;
  isAdminAccount: boolean;
  isBusy: boolean;
  isConfirmingDelete: boolean;
  passwordPanelTitle: string;
  resetPasswordResult: Nullable<string>;
  status: WorkerStatus;
  worker: WorkerDetail;
}
