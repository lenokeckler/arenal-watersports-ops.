import type { JSX } from "react";
import {
  INPUT_TYPES,
  WORKER_DETAIL_SCREEN,
  WORKER_MARK,
  WORKER_MARK_DESCRIPTION,
  WORKER_MARK_LABEL,
  type WorkerMark,
} from "@/app/constants";

interface WorkerDetailMarksProps {
  isBusy: boolean;
  marks: WorkerMark[];
  onToggleMark: (
    mark: WorkerMark,
    isGranted: boolean
  ) => void;
}

const ALL_MARKS: readonly WorkerMark[] =
  Object.values(WORKER_MARK);

/**
 * The three marks (US-ADM-003/004/005): independent of role, each with its
 * own name and its own single toggle here.
 */
const WorkerDetailMarks = ({
  isBusy,
  marks,
  onToggleMark,
}: WorkerDetailMarksProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {WORKER_DETAIL_SCREEN.MARKS.TITLE}
    </h2>

    <div className="flex flex-col gap-sm">
      {ALL_MARKS.map((mark) => {
        const isGranted = marks.includes(mark);

        return (
          <label
            key={mark}
            className="flex items-start gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm"
          >
            <input
              type={INPUT_TYPES.CHECKBOX}
              checked={isGranted}
              disabled={isBusy}
              onChange={() => onToggleMark(mark, isGranted)}
              className="mt-1 h-5 w-5"
            />
            <span className="flex flex-col gap-1">
              <span className="font-body-base text-body-base text-on-surface">
                {WORKER_MARK_LABEL[mark]}
              </span>
              <span className="font-label-mono text-label-mono text-on-surface-variant">
                {WORKER_MARK_DESCRIPTION[mark]}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  </section>
);

export default WorkerDetailMarks;
