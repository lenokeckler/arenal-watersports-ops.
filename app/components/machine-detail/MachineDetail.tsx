"use client";

import type { JSX } from "react";
import MachineConditionPhotos from "./components/MachineConditionPhotos";
import MachineDetailActions from "./components/MachineDetailActions";
import MachineDetailHeader from "./components/MachineDetailHeader";
import MachineTelemetryCard from "./components/MachineTelemetryCard";
import { useMachineDetailViewModel } from "./hooks/useMachineDetailViewModel";
import type { MachineDetailProps } from "./models/MachineDetailProps.interface";

/**
 * `/operaciones/maquinas/[unitId]`. Presentation only: the ficha of one
 * machine — what it accumulated (US-OPE-010, US-OPE-011), whether it needs
 * an oil change (US-OPE-012), how it looks today (US-OPE-016) and whether
 * it is out of the water (US-OPE-017).
 */
const MachineDetail = (
  props: MachineDetailProps
): JSX.Element => {
  const {
    error,
    handlePhotoSelected,
    handleStatusChange,
    isBusy,
    isOutOfService,
    uploadingAngle,
  } = useMachineDetailViewModel(props);

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-32 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <MachineDetailHeader
        categoryId={props.machine.categoryId}
        categoryName={props.machine.categoryName}
        code={props.machine.code}
        status={props.machine.status}
      />

      <main className="mx-auto flex max-w-3xl flex-col gap-md">
        <MachineTelemetryCard machine={props.machine} />

        {props.machine.hasConditionPhotos && (
          <MachineConditionPhotos
            canUpload={props.canUploadPhotos}
            impactCount={props.machine.impactCount}
            onPhotoSelected={handlePhotoSelected}
            photos={props.photos}
            uploadingAngle={uploadingAngle}
          />
        )}

        {error && (
          <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
            {error}
          </p>
        )}

        <MachineDetailActions
          isBusy={isBusy}
          isOutOfService={isOutOfService}
          onStatusChange={handleStatusChange}
          unitId={props.machine.id}
        />
      </main>
    </div>
  );
};

export default MachineDetail;
