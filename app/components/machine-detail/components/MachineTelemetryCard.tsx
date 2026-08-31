import type { JSX } from "react";
import {
  MACHINE_DETAIL_SCREEN,
  STRING,
  USAGE_METRIC_LABEL,
} from "@/app/constants";
import type { MachineDetail } from "@/app/utils/operaciones/machines";
import MachineOilChangeNotice from "./MachineOilChangeNotice";

interface MachineTelemetryCardProps {
  machine: MachineDetail;
}

const CARD_CLASS =
  "flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md";

const MachineTelemetryValue = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element => (
  <div className="flex flex-col gap-1">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {label}
    </span>
    <span className="font-title-md text-title-md text-on-surface">
      {value}
    </span>
  </div>
);

/**
 * US-OPE-010, US-OPE-011, US-OPE-012 and US-OPE-016 read from one card:
 * the gasoline the machine came back with, its accumulated meter, how many
 * impacts it carries, and whether it already reached its oil-change
 * threshold. Each block only shows where its category says it applies.
 */
const MachineTelemetryCard = ({
  machine,
}: MachineTelemetryCardProps): JSX.Element => (
  <section className={CARD_CLASS}>
    <h2 className="font-title-md text-title-md text-on-surface">
      {MACHINE_DETAIL_SCREEN.TELEMETRY.TITLE}
    </h2>

    <div className="grid grid-cols-2 gap-md">
      {machine.consumesFuel && (
        <MachineTelemetryValue
          label={MACHINE_DETAIL_SCREEN.TELEMETRY.FUEL}
          value={
            machine.currentFuel === null
              ? STRING.N_A
              : `${machine.currentFuel}%`
          }
        />
      )}

      {machine.hasMotor && machine.usageMetric && (
        <MachineTelemetryValue
          label={USAGE_METRIC_LABEL[machine.usageMetric]}
          value={String(machine.usageTotal)}
        />
      )}

      <MachineTelemetryValue
        label={MACHINE_DETAIL_SCREEN.TELEMETRY.IMPACTS}
        value={String(machine.impactCount)}
      />

      {machine.serviceStatus && (
        <MachineTelemetryValue
          label={
            MACHINE_DETAIL_SCREEN.TELEMETRY.NEXT_OIL_CHANGE
          }
          value={String(
            machine.serviceStatus.nextOilChangeAt
          )}
        />
      )}
    </div>

    {machine.serviceStatus && (
      <MachineOilChangeNotice
        serviceStatus={machine.serviceStatus}
        usageMetric={machine.usageMetric}
      />
    )}
  </section>
);

export default MachineTelemetryCard;
