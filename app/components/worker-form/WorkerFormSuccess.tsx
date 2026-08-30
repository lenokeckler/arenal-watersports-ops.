import type { JSX } from "react";
import { MATERIAL_ICON_NAME, PATHS, WORKER_FORM_SCREEN } from "@/app/constants";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface WorkerFormSuccessProps {
  onCopyTemporaryPassword: () => void;
  temporaryPassword: string;
  workerId: string;
}

/**
 * Shown once, right after `POST /api/administracion/trabajadores`
 * succeeds (US-ADM-001): the only moment the temporary password is ever
 * visible — the route never stores it and no screen can show it again.
 */
const WorkerFormSuccess = ({
  onCopyTemporaryPassword,
  temporaryPassword,
  workerId,
}: WorkerFormSuccessProps): JSX.Element => (
  <div className="flex flex-col gap-md rounded-xl border border-primary/30 bg-primary/5 p-md">
    <div className="flex items-center gap-sm text-primary">
      <MaterialIcon name={MATERIAL_ICON_NAME.CHECK_CIRCLE} />
      <span className="font-title-md text-title-md">
        {WORKER_FORM_SCREEN.SUCCESS.TITLE}
      </span>
    </div>

    <div className="flex flex-col gap-1">
      <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
        {WORKER_FORM_SCREEN.SUCCESS.TEMPORARY_PASSWORD_LABEL}
      </span>
      <div className="flex items-center gap-sm rounded-lg border border-white/10 bg-surface-container-low px-sm py-2">
        <span className="flex-1 font-label-mono text-title-md tracking-wider text-on-surface">
          {temporaryPassword}
        </span>
        <button
          type="button"
          onClick={onCopyTemporaryPassword}
          className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-on-surface-variant hover:text-primary"
        >
          <MaterialIcon name={MATERIAL_ICON_NAME.CONTENT_COPY} />
        </button>
      </div>
    </div>

    <p className="font-body-base text-body-base text-on-surface-variant">
      {WORKER_FORM_SCREEN.SUCCESS.WARNING}
    </p>

    <Link
      href={PATHS.ADMIN.WORKER_DETAIL(workerId)}
      className="flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-md font-button text-button uppercase text-on-primary-fixed transition-all hover:brightness-110"
    >
      {WORKER_FORM_SCREEN.SUCCESS.VIEW_WORKER}
    </Link>
  </div>
);

export default WorkerFormSuccess;
