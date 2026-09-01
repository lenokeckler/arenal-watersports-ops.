import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  WORK_AREA_LABEL,
  WORKER_DETAIL_SCREEN,
  type WorkArea,
} from "@/app/constants";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface WorkerDetailAreasProps {
  additionalAreas: WorkArea[];
  availableAreas: WorkArea[];
  isBusy: boolean;
  onAddArea: (area: WorkArea) => void;
  onRemoveArea: (area: WorkArea) => void;
}

const NO_AREAS = 0;

/**
 * US-ADM-002: whole additional areas, never loose permissions — granting
 * adds a full area chip, revoking removes it, both take effect
 * immediately.
 */
const WorkerDetailAreas = ({
  additionalAreas,
  availableAreas,
  isBusy,
  onAddArea,
  onRemoveArea,
}: WorkerDetailAreasProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {WORKER_DETAIL_SCREEN.AREAS.TITLE}
    </h2>

    {additionalAreas.length === NO_AREAS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {WORKER_DETAIL_SCREEN.AREAS.EMPTY}
      </p>
    ) : (
      <ul className="flex flex-wrap gap-sm">
        {additionalAreas.map((area) => (
          <li
            key={area}
            className="flex min-h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-sm text-primary"
          >
            <span className="font-body-base text-body-base">
              {WORK_AREA_LABEL[area]}
            </span>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onRemoveArea(area)}
              aria-label={WORK_AREA_LABEL[area]}
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-primary/20 disabled:opacity-50"
            >
              <MaterialIcon
                name={MATERIAL_ICON_NAME.CLOSE}
                className="!text-[16px]"
              />
            </button>
          </li>
        ))}
      </ul>
    )}

    {availableAreas.length > NO_AREAS && (
      <div className="flex flex-wrap gap-sm">
        {availableAreas.map((area) => (
          <button
            key={area}
            type="button"
            disabled={isBusy}
            onClick={() => onAddArea(area)}
            className="flex min-h-10 items-center gap-1 rounded-full border border-outline-variant px-sm text-on-surface-variant hover:border-primary/40 hover:text-primary disabled:opacity-50"
          >
            <MaterialIcon
              name={MATERIAL_ICON_NAME.ADD}
              className="!text-[16px]"
            />
            {WORK_AREA_LABEL[area]}
          </button>
        ))}
      </div>
    )}
  </section>
);

export default WorkerDetailAreas;
