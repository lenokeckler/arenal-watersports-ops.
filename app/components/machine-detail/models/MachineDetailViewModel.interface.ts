import type { Nullable } from "@/app/types";
import type { PhotoAngle } from "@/app/constants";

export interface MachineDetailViewModel {
  error: Nullable<string>;
  handlePhotoSelected: (
    angle: PhotoAngle,
    file: File
  ) => void;
  handleStatusChange: () => void;
  isBusy: boolean;
  isOutOfService: boolean;
  uploadingAngle: Nullable<PhotoAngle>;
}
