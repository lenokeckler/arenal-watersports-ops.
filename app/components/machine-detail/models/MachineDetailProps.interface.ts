import type { ConditionPhoto } from "@/app/utils/operaciones/conditionPhotos";
import type { MachineDetail } from "@/app/utils/operaciones/machines";

export interface MachineDetailProps {
  /** US-OPE-015: only the `encargado_general` mark, plus administración. */
  canUploadPhotos: boolean;
  machine: MachineDetail;
  photos: ConditionPhoto[];
  workerId: string;
}
